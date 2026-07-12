/* ============================================================
   StadiumAI Hub — AI Assistant (Server Proxy Integration)
   Routes all AI requests through the backend proxy /api/ai/chat.
   API key is stored server-side in .env — never exposed to browser.
   ============================================================ */

const AIAssistant = (() => {
  let conversationHistory = [];
  let isProcessing = false;

  // System prompt for FIFA World Cup 2026 context (used for fallback only)
  const SYSTEM_PROMPT = `You are StadiumAI, an intelligent, friendly, and multilingual AI assistant for the FIFA World Cup 2026.`;

  // Initialize
  function init() {
    // No API key needed on client — handled server-side
  }

  // Check if AI is available (always attempt via proxy)
  function hasApiKey() {
    return true; // Proxy handles key presence check
  }

  // Send message via backend proxy
  async function sendMessage(userMessage, language = 'en') {
    if (isProcessing) return null;
    isProcessing = true;

    // Add user message to local history
    conversationHistory.push({
      role: 'user',
      parts: [{ text: userMessage }],
    });

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          language,
          conversationHistory: conversationHistory.slice(-16),
        }),
      });

      if (!response.ok) {
        throw new Error(`Proxy error: ${response.status}`);
      }

      const data = await response.json();

      // If the server returned a fallback signal (no API key configured)
      if (data.fallback) {
        isProcessing = false;
        const fallback = getFallbackResponse(userMessage, language);
        conversationHistory.push({
          role: 'model',
          parts: [{ text: fallback }],
        });
        return fallback;
      }

      const aiText =
        data.reply || 'I apologize, I could not process that request. Please try again.';

      conversationHistory.push({
        role: 'model',
        parts: [{ text: aiText }],
      });

      // Keep conversation history manageable
      if (conversationHistory.length > 20) {
        conversationHistory = conversationHistory.slice(-16);
      }

      isProcessing = false;
      return aiText;
    } catch (error) {
      console.error('AI proxy error:', error);
      isProcessing = false;

      const fallback = getFallbackResponse(userMessage, language);
      conversationHistory.push({
        role: 'model',
        parts: [{ text: fallback }],
      });
      return fallback;
    }
  }

  // Translate text via backend proxy
  async function translate(text, fromLang, toLang) {
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Translate the following text from ${fromLang} to ${toLang}. Only output the translation, nothing else. Context: This is in a FIFA World Cup 2026 stadium setting.\n\nText: ${text}`,
          language: toLang,
        }),
      });

      if (!response.ok) throw new Error('Translation proxy error');

      const data = await response.json();

      if (data.fallback) {
        return getOfflineTranslation(text, fromLang, toLang);
      }

      return data.reply || 'Translation unavailable';
    } catch (error) {
      console.error('Translation error:', error);
      return getOfflineTranslation(text, fromLang, toLang);
    }
  }

  // Fallback responses when API is not available
  function getFallbackResponse(message, language) {
    const msg = message.toLowerCase();

    // Language-specific fallback greetings
    const greetings = {
      en: "I'm currently running in demo mode. To enable full AI capabilities, ask your administrator to configure the Gemini API key on the server. ",
      es: 'Estoy en modo demo. Para habilitar las capacidades completas de IA, pida al administrador que configure la clave API de Gemini en el servidor. ',
      fr: 'Je suis en mode démo. Pour activer les capacités IA complètes, demandez à votre administrateur de configurer la clé API Gemini sur le serveur. ',
    };

    const prefix = greetings[language] || greetings.en;

    // Contextual fallback responses
    if (
      msg.includes('restroom') ||
      msg.includes('bathroom') ||
      msg.includes('toilet') ||
      msg.includes('baño')
    ) {
      return (
        prefix +
        '🚻 **Nearest restrooms:** Level 1 East Wing (Section E1-E3) — currently available with short wait times. Additional restrooms are on Level 2 near Gate B and Level 3 behind Section C4.'
      );
    }

    if (
      msg.includes('food') ||
      msg.includes('eat') ||
      msg.includes('hungry') ||
      msg.includes('comida')
    ) {
      return (
        prefix +
        '🍔 **Food options nearby:** Food Court North (Level 2, Gate B) has burgers, pizza, and tacos — currently busy. Food Court South (Level 1, Gate D) has lighter wait times with international cuisine, grill options, and vegetarian/vegan selections.'
      );
    }

    if (msg.includes('seat') || msg.includes('section') || msg.includes('asiento')) {
      return (
        prefix +
        '💺 **Finding your seat:** From your nearest gate, follow the section markers on the walls. Section letters (A-F) indicate the stand level, numbers (1-8) indicate the column. Stewards at each section entrance can guide you to your exact row and seat.'
      );
    }

    if (
      msg.includes('exit') ||
      msg.includes('leave') ||
      msg.includes('parking') ||
      msg.includes('salida')
    ) {
      return (
        prefix +
        '🚗 **Exit recommendation:** Gate D currently has the lowest congestion (45%). Parking Lot C (East) has 66% availability. If using metro, Line A station is 3-minute walk from Gate A with trains every 3 minutes. Best departure window: 85th minute for shortest exit time (~12 min).'
      );
    }

    if (
      msg.includes('wheelchair') ||
      msg.includes('accessible') ||
      msg.includes('disability') ||
      msg.includes('accesib')
    ) {
      return (
        prefix +
        '♿ **Accessibility:** Wheelchair-accessible entrance at Gate D (ramp access). Elevators located at Gates A, C, and D. Accessible seating in Sections A2, C4, and E6. Service animal relief area near Gate B outdoor plaza. For assistance, ask any steward or call the accessibility hotline at the information desk.'
      );
    }

    if (
      msg.includes('score') ||
      msg.includes('match') ||
      msg.includes('game') ||
      msg.includes('partido')
    ) {
      return (
        prefix +
        "⚽ **Current match:** Brazil 🇧🇷 2 - 1 🇩🇪 Germany | 67th minute at MetLife Stadium. Brazil's goals by Vinícius Jr. (23') and Rodrygo (51'). Germany pulled one back through Musiala (44'). Next match at this venue: USA vs Mexico at 18:00."
      );
    }

    if (
      msg.includes('weather') ||
      msg.includes('temperature') ||
      msg.includes('rain') ||
      msg.includes('clima')
    ) {
      return (
        prefix +
        '🌤️ **Current weather:** 75°F (24°C), clear skies with light breeze. No rain expected during the match. UV index is moderate — sunscreen recommended for open sections. Stadium roof panels are partially open for ventilation.'
      );
    }

    if (
      msg.includes('emergency') ||
      msg.includes('help') ||
      msg.includes('medical') ||
      msg.includes('doctor') ||
      msg.includes('emergencia')
    ) {
      return '🚨 **Emergency:** For immediate medical assistance, the nearest First Aid station is at Level 1, Gate A Lobby. Alert the nearest steward (in yellow vest) or call the stadium emergency line. Medical teams are on standby and can reach any section within 2 minutes. If life-threatening, also call 911.';
    }

    if (
      msg.includes('crowd') ||
      msg.includes('busy') ||
      msg.includes('congestion') ||
      msg.includes('multitud')
    ) {
      return (
        prefix +
        '👥 **Crowd status:** Average stadium density is at 72%. North Stand sections B2-B4 are currently most crowded (90%+). East Concourse has the most breathing room. Food Court North is busy — try Food Court South for shorter queues. Gate C has the highest entry flow; Gates D and F are less congested.'
      );
    }

    if (
      msg.includes('wifi') ||
      msg.includes('internet') ||
      msg.includes('charge') ||
      msg.includes('phone')
    ) {
      return (
        prefix +
        "📱 **Connectivity:** Free stadium WiFi: Connect to 'FIFA_WC2026_Free'. Password not required. Charging stations are located near Gates A and C on Level 1, and at the Fan Zone on Level 2. Download the official FIFA app for interactive features."
      );
    }

    if (
      msg.includes('water') ||
      msg.includes('drink') ||
      msg.includes('agua') ||
      msg.includes('bebida')
    ) {
      return (
        prefix +
        '💧 **Water & Drinks:** Free water refill stations are located at all concourse levels near the restrooms (look for the blue 💧 signs). The sustainability team encourages reusable bottles! Beverage stands with soft drinks, beer, and juices are available at all food courts and mobile vendors throughout the concourse.'
      );
    }

    // Default response
    return (
      prefix +
      'I can help you with:\n\n🗺️ **Navigation** — "Where is my seat?", "Find restrooms"\n🚗 **Transport** — "Parking availability", "When to leave"\n♿ **Accessibility** — "Wheelchair access", "Elevators"\n🌍 **Translation** — Ask in any language!\n📊 **Live Updates** — "What\'s the score?", "Crowd level"\n🚨 **Emergency** — "I need medical help"\n\nTry asking one of these!'
    );
  }

  // Offline translation fallback
  function getOfflineTranslation(text, fromLang, toLang) {
    // Check phrase database
    if (typeof DashboardData !== 'undefined') {
      const fromPhrases = DashboardData.phrases[fromLang];
      const toPhrases = DashboardData.phrases[toLang];

      if (fromPhrases && toPhrases) {
        const idx = fromPhrases.findIndex((p) => p.text.toLowerCase() === text.toLowerCase());
        if (idx !== -1 && toPhrases[idx]) {
          return toPhrases[idx].text;
        }
      }
    }

    return `[Demo mode] Translation from ${fromLang} to ${toLang} requires the Gemini API key to be configured on the server.`;
  }

  // Clear conversation
  function clearHistory() {
    conversationHistory = [];
  }

  // Get processing state
  function isTyping() {
    return isProcessing;
  }

  return {
    init,
    hasApiKey,
    sendMessage,
    translate,
    clearHistory,
    isTyping,
  };
})();
