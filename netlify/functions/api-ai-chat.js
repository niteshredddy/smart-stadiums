exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const ALLOWED_LANGUAGES = ['en', 'es', 'fr', 'ar', 'pt', 'de', 'ja', 'ko', 'zh', 'hi'];

  try {
    const body = JSON.parse(event.body || '{}');
    const { message, language, conversationHistory } = body;

    if (!message || typeof message !== 'string') {
      return { statusCode: 400, body: JSON.stringify({ error: 'Message is required and must be a string.' }) };
    }

    if (message.trim().length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Message cannot be empty.' }) };
    }

    if (message.length > 2000) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Message must be 2000 characters or less.' }) };
    }

    const lang = language || 'en';
    if (!ALLOWED_LANGUAGES.includes(lang)) {
      return { statusCode: 400, body: JSON.stringify({ error: `Invalid language. Allowed: ${ALLOWED_LANGUAGES.join(', ')}` }) };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*' // Ideally should be locked down in production
    };

    if (!apiKey || apiKey.trim().length < 10) {
      // Return a signal that triggers fallback on the client
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ fallback: true, message: 'AI features are in demo mode. Set GEMINI_API_KEY in Netlify to enable.' })
      };
    }

    // Build conversation contents
    const contents = Array.isArray(conversationHistory) ? conversationHistory.slice(-16) : [];
    contents.push({
      role: 'user',
      parts: [{ text: message }]
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

    // Because fetch is available natively in Node 18+ (Netlify functions run on 18/20 by default now)
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
          ]
        })
      }
    );

    if (!response.ok) {
      console.error('Gemini API error:', response.status);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ fallback: true, message: 'AI service temporarily unavailable.' })
      };
    }

    const data = await response.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, I could not process that request.';

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        reply: aiText,
        role: 'model',
      })
    };

  } catch (error) {
    console.error('AI proxy error:', error.message);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ fallback: true, message: 'AI service error. Please try again.' })
    };
  }
};
