const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const { aiLimiter } = require('../middleware/security');
const { sustainabilityCache, staffCache } = require('../middleware/cache');

/**
 * Validated languages for AI translator
 */
const ALLOWED_LANGUAGES = ['en', 'es', 'fr', 'ar', 'pt', 'de', 'ja', 'ko', 'zh', 'hi'];

/**
 * Creates an Express Router configured with all API endpoints
 * @param {import('../database')} db - Database instance
 * @returns {import('express').Router} Express Router
 */
function createApiRouter(db) {
  const router = express.Router();

  /**
   * @route GET /api/health
   * @desc Server health status
   */
  router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  /**
   * @route GET /api/crowd/density
   * @desc Get crowd density by zone
   */
  router.get(
    '/crowd/density',
    asyncHandler(async (req, res) => {
      const data = await db.getCrowdDensity();
      res.json(data);
    })
  );

  /**
   * @route GET /api/crowd/stats
   * @desc Get crowd statistics
   */
  router.get(
    '/crowd/stats',
    asyncHandler(async (req, res) => {
      const stats = await db.getCrowdStats();
      res.json(stats);
    })
  );

  /**
   * @route GET /api/gates/status
   * @desc Get all gate statuses
   */
  router.get(
    '/gates/status',
    asyncHandler(async (req, res) => {
      const gates = await db.getGateStatus();
      res.json(gates);
    })
  );

  /**
   * @route GET /api/parking/status
   * @desc Get parking lot availability
   */
  router.get(
    '/parking/status',
    asyncHandler(async (req, res) => {
      const parking = await db.getParkingStatus();
      res.json(parking);
    })
  );

  /**
   * @route GET /api/matches/live
   * @desc Get live match data
   */
  router.get(
    '/matches/live',
    asyncHandler(async (req, res) => {
      const matches = await db.getLiveMatches();
      res.json(matches);
    })
  );

  /**
   * @route GET /api/operations/incidents
   * @desc Get active incidents
   */
  router.get(
    '/operations/incidents',
    asyncHandler(async (req, res) => {
      const incidents = await db.getIncidents();
      res.json(incidents);
    })
  );

  /**
   * @route GET /api/operations/staff
   * @desc Get staff deployment status (cached)
   */
  router.get(
    '/operations/staff',
    asyncHandler(async (req, res) => {
      const cached = staffCache.get();
      if (cached) return res.json(cached);

      const staff = await db.getStaffStatus();
      staffCache.set(staff);
      res.json(staff);
    })
  );

  /**
   * @route GET /api/sustainability/metrics
   * @desc Get sustainability metrics (cached)
   */
  router.get(
    '/sustainability/metrics',
    asyncHandler(async (req, res) => {
      const cached = sustainabilityCache.get();
      if (cached) return res.json(cached);

      const metrics = await db.getSustainabilityMetrics();
      sustainabilityCache.set(metrics);
      res.json(metrics);
    })
  );

  /**
   * @route POST /api/ai/chat
   * @desc Proxy to Gemini API
   */
  router.post(
    '/ai/chat',
    aiLimiter,
    asyncHandler(async (req, res) => {
      const { message, language, conversationHistory } = req.body;

      // Input validation
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required and must be a string.' });
      }
      if (message.trim().length === 0) {
        return res.status(400).json({ error: 'Message cannot be empty.' });
      }
      if (message.length > 2000) {
        return res.status(400).json({ error: 'Message must be 2000 characters or less.' });
      }

      const lang = language || 'en';
      if (!ALLOWED_LANGUAGES.includes(lang)) {
        return res
          .status(400)
          .json({ error: `Invalid language. Allowed: ${ALLOWED_LANGUAGES.join(', ')}` });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey.trim().length < 10) {
        return res.json({
          fallback: true,
          message: 'AI features are in demo mode. Set GEMINI_API_KEY in .env to enable.',
        });
      }

      const contents = Array.isArray(conversationHistory) ? conversationHistory.slice(-16) : [];
      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const SYSTEM_PROMPT = `You are StadiumAI, an intelligent, friendly, and multilingual AI assistant for the FIFA World Cup 2026. You are deployed inside stadiums across the USA, Mexico, and Canada to help fans, staff, volunteers, and organizers.

Your capabilities:
1. **Navigation**: Help fans find their seats, restrooms, food courts, first aid, merchandise stores, and exits.
2. **Crowd Management**: Report current crowd density, suggest less crowded routes, warn about congestion zones.
3. **Accessibility**: Provide wheelchair-accessible routes, elevator locations, accessible seating, sensory rooms.
4. **Transportation**: Advise on parking availability, metro/shuttle schedules, rideshare options.
5. **Sustainability**: Share recycling station locations, water refill stations, eco-friendly options.
6. **Match Info**: Current scores, upcoming matches, team lineups.
7. **Multilingual**: Respond in whatever language the user writes in.
8. **Emergency**: For medical emergencies, direct to nearest first aid. Always prioritize safety.

Guidelines:
- Be concise but helpful (2-4 sentences ideal for simple queries)
- Use emoji sparingly but effectively
- If you don't know something, say so honestly
- Respond in the same language the user uses`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents,
            generationConfig: {
              temperature: 0.7,
              topP: 0.9,
              topK: 40,
              maxOutputTokens: 512,
            },
            safetySettings: [
              { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
            ],
          }),
        }
      );

      if (!response.ok) {
        console.error('Gemini API error:', response.status);
        return res.json({ fallback: true, message: 'AI service temporarily unavailable.' });
      }

      const data = await response.json();
      const aiText =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        'I apologize, I could not process that request.';

      return res.json({
        reply: aiText,
        role: 'model',
      });
    })
  );

  return router;
}

module.exports = { createApiRouter };
