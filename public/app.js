/* ============================================================
   StadiumAI Hub — Core Application Logic
   SPA navigation, role switching, data refresh,
   event handling, and initialization
   ============================================================ */

(function () {
  'use strict';

  // ---- State ----
  let currentSection = 'overview';
  let currentRole = 'fan';
  let refreshInterval = null;
  let socket = null;

  // ---- DOM Refs ----
  const sidebar = document.getElementById('sidebar');
  const chatPanel = document.getElementById('chatPanel');
  const notifPanel = document.getElementById('notifPanel');
  const settingsModal = document.getElementById('settingsModal');
  const dashboardContent = document.getElementById('dashboardContent');
  const pageTitle = document.getElementById('pageTitle');

  // ---- Navigation ----
  function navigateTo(section) {
    currentSection = section;

    // Update nav links
    document.querySelectorAll('.nav-link').forEach((link) => {
      const isActive = link.dataset.section === section;
      link.classList.toggle('active', isActive);
      link.setAttribute('aria-current', isActive ? 'page' : 'false');
    });

    // Update section panels
    document.querySelectorAll('.section-panel').forEach((panel) => {
      panel.classList.remove('active');
    });

    const targetPanel = document.getElementById('section' + capitalize(section));
    if (targetPanel) {
      targetPanel.classList.add('active');
    }

    // Update page title
    const titles = {
      overview: 'Overview',
      crowd: 'Crowd Intelligence',
      navigation: 'Stadium Navigation',
      transport: 'Transportation Hub',
      translator: 'Multilingual Translator',
      sustainability: 'Sustainability',
      operations: 'Operations Center',
    };
    if (pageTitle) pageTitle.textContent = titles[section] || 'Dashboard';

    // Render section-specific content
    renderSection(section);

    // Trigger animation
    if (window.Animations) {
      window.Animations.sectionTransition('section' + capitalize(section));
    }

    // Close mobile sidebar
    if (window.innerWidth <= 1024) {
      sidebar.classList.remove('open');
    }
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // ---- Role Switching ----
  function switchRole(role) {
    currentRole = role;

    // Update role buttons
    document.querySelectorAll('.role-btn').forEach((btn) => {
      const isActive = btn.dataset.role === role;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    // Show/hide role-specific elements
    document.querySelectorAll('[data-role-visible]').forEach((el) => {
      const roles = el.dataset.roleVisible.split(' ');
      el.style.display = roles.includes(role) || roles.includes('all') ? '' : 'none';
    });

    // If currently on operations and switching to fan, go to overview
    if (currentSection === 'operations' && role === 'fan') {
      navigateTo('overview');
    }

    showToast(`Switched to ${role.charAt(0).toUpperCase() + role.slice(1)} view`, '👤');
  }

  // ---- Section Rendering ----
  function renderSection(section) {
    switch (section) {
      case 'overview':
        CrowdData.renderHeatmap('miniHeatmap');
        DashboardData.renderGateBars('gateBars');
        break;

      case 'crowd':
        CrowdData.renderHeatmap('fullHeatmap');
        CrowdData.updateStatsDisplay();
        DashboardData.renderGateBars('gateBarsFull');
        break;

      case 'navigation':
        StadiumMap.render('stadiumMapContainer');
        break;

      case 'transport':
        DashboardData.renderParkingBars('parkingBars');
        break;

      case 'translator':
        const fromLang = document.getElementById('langFrom')?.value || 'en';
        const toLang = document.getElementById('langTo')?.value || 'es';
        DashboardData.renderPhraseCards('phraseCards', fromLang, toLang);
        break;

      case 'sustainability':
        // Static content, already in HTML
        break;

      case 'operations':
        DashboardData.renderIncidents('incidentFeed');
        DashboardData.renderStaffGrid('staffGrid');
        break;
    }
  }

  // ---- Chat Panel ----
  function toggleChat() {
    const isOpen = chatPanel.classList.toggle('open');
    // Close notification panel if open
    if (isOpen) notifPanel.classList.remove('open');

    // Update aria-expanded
    const chatToggleBtn = document.getElementById('chatToggleBtn');
    if (chatToggleBtn) chatToggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

    // Focus management: focus chat input when opening
    if (isOpen) {
      const chatInput = document.getElementById('chatInput');
      if (chatInput) setTimeout(() => chatInput.focus(), 300);
    }

    // Trigger animation
    if (window.Animations) {
      window.Animations.chatPanel(isOpen);
    }
  }

  function closeChat() {
    chatPanel.classList.remove('open');
    const chatToggleBtn = document.getElementById('chatToggleBtn');
    if (chatToggleBtn) {
      chatToggleBtn.setAttribute('aria-expanded', 'false');
      chatToggleBtn.focus(); // Return focus to toggle
    }
  }

  async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const messages = document.getElementById('chatMessages');
    const text = input.value.trim();
    if (!text) return;

    const language = document.getElementById('chatLangSelect')?.value || 'en';

    // Add user message
    appendMessage('user', text);
    input.value = '';
    input.style.height = 'auto';

    // Show typing indicator
    const typingEl = showTypingIndicator(messages);

    // Get AI response
    const response = await AIAssistant.sendMessage(text, language);

    // Remove typing indicator
    if (typingEl) typingEl.remove();

    // Add AI response
    if (response) {
      appendMessage('ai', response);
    }
  }

  function appendMessage(type, text) {
    const messages = document.getElementById('chatMessages');
    if (!messages) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Format text: convert markdown bold and newlines
    const formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');

    const msgHTML = `
      <div class="chat-message ${type}" role="log">
        <div class="msg-avatar" role="img" aria-label="${type === 'ai' ? 'AI Assistant' : 'You'}">
          ${type === 'ai' ? '🤖' : '👤'}
        </div>
        <div>
          <div class="msg-bubble">${formatted}</div>
          <div class="msg-time">${timeStr}</div>
        </div>
      </div>
    `;

    messages.insertAdjacentHTML('beforeend', msgHTML);
    messages.scrollTop = messages.scrollHeight;
  }

  function showTypingIndicator(container) {
    const typing = document.createElement('div');
    typing.className = 'chat-message ai';
    typing.setAttribute('role', 'status');
    typing.setAttribute('aria-label', 'AI is typing');
    typing.innerHTML = `
      <div class="msg-avatar" role="img" aria-label="AI Assistant">🤖</div>
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    `;
    container.appendChild(typing);
    container.scrollTop = container.scrollHeight;
    return typing;
  }

  // ---- Notifications Panel ----
  function toggleNotifications() {
    const isOpen = notifPanel.classList.toggle('open');
    if (isOpen) chatPanel.classList.remove('open');

    const notifBtn = document.getElementById('notifBtn');
    if (notifBtn) notifBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

    // Trigger animation
    if (window.Animations) {
      window.Animations.notificationPanel(isOpen);
    }
  }

  // ---- Settings Modal ----
  function openSettings() {
    settingsModal.classList.add('open');
    settingsModal.setAttribute('aria-hidden', 'false');

    // Focus the first interactive element in the modal
    const firstInput = settingsModal.querySelector('select, input, button');
    if (firstInput) setTimeout(() => firstInput.focus(), 300);

    // Trigger animation
    if (window.Animations) {
      window.Animations.modal(true);
    }
  }

  function closeSettings() {
    settingsModal.classList.remove('open');
    settingsModal.setAttribute('aria-hidden', 'true');

    // Return focus to settings button
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) settingsBtn.focus();

    // Trigger animation
    if (window.Animations) {
      window.Animations.modal(false);
    }
  }

  function saveSettings() {
    showToast('Settings saved!', '✅');
    closeSettings();
  }

  // ---- Toast Notifications ----
  function showToast(message, icon = 'ℹ️') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
      <span class="toast-icon" role="img" aria-hidden="true">${icon}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close" onclick="this.parentElement.remove()" aria-label="Dismiss notification">✕</button>
    `;
    container.appendChild(toast);

    // Auto-remove
    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 5000);
  }

  // ---- Translator ----
  async function handleTranslation() {
    const input = document.getElementById('translatorInput');
    const output = document.getElementById('translatorOutput');
    const fromLang = document.getElementById('langFrom')?.value || 'en';
    const toLang = document.getElementById('langTo')?.value || 'es';

    if (!input?.value.trim()) return;

    output.value = 'Translating...';

    const result = await AIAssistant.translate(input.value.trim(), fromLang, toLang);
    output.value = result;
  }

  function swapLanguages() {
    const from = document.getElementById('langFrom');
    const to = document.getElementById('langTo');
    if (from && to) {
      const temp = from.value;
      from.value = to.value;
      to.value = temp;
      // Re-render phrase cards
      DashboardData.renderPhraseCards('phraseCards', from.value, to.value);
    }
  }

  // ---- Data Refresh Loop ----
  // Only handles local simulation data that ISN'T fetched from server via polling.
  // Server data (crowd density, gates, matches) comes via WSClient events.
  function startDataRefresh() {
    refreshInterval = setInterval(() => {
      // Update local simulation data
      CrowdData.updateDensities();
      DashboardData.updateOverviewStats();
      DashboardData.updateGates();
      DashboardData.updateParkingLots();

      // Re-render active section with locally simulated data
      switch (currentSection) {
        case 'overview':
          CrowdData.renderHeatmap('miniHeatmap');
          DashboardData.renderGateBars('gateBars');
          break;
        case 'crowd':
          CrowdData.renderHeatmap('fullHeatmap');
          CrowdData.updateStatsDisplay();
          DashboardData.renderGateBars('gateBarsFull');
          break;
        case 'navigation':
          StadiumMap.updateColors('stadiumMapContainer');
          break;
        case 'transport':
          DashboardData.renderParkingBars('parkingBars');
          break;
      }
    }, 5000); // Update every 5 seconds
  }

  // ---- Listen to WebSocket events for server-sourced data ----
  function setupWSListeners() {
    if (!window.WSClient) return;

    window.WSClient.on('crowdUpdate', (data) => {
      // Update UI when server sends crowd data
      if (currentSection === 'overview') {
        CrowdData.renderHeatmap('miniHeatmap');
      } else if (currentSection === 'crowd') {
        CrowdData.renderHeatmap('fullHeatmap');
        CrowdData.updateStatsDisplay();
      }
    });

    window.WSClient.on('gatesUpdate', (data) => {
      if (currentSection === 'overview') {
        DashboardData.renderGateBars('gateBars');
      } else if (currentSection === 'crowd') {
        DashboardData.renderGateBars('gateBarsFull');
      }
    });

    window.WSClient.on('matchesUpdate', (data) => {
      // Matches are mostly static HTML, but could be extended
    });
  }

  // ---- Auto-resize chat input ----
  function autoResizeInput(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
  }

  // ---- Event Listeners ----
  function bindEvents() {
    // Navigation — keyboard accessible
    document.querySelectorAll('.nav-link').forEach((link) => {
      link.setAttribute('tabindex', '0');
      link.setAttribute('role', 'button');

      link.addEventListener('click', () => {
        navigateTo(link.dataset.section);
      });

      // Keyboard: Enter and Space
      link.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigateTo(link.dataset.section);
        }
      });
    });

    // Role switching
    document.querySelectorAll('.role-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        switchRole(btn.dataset.role);
      });
    });

    // Mobile menu
    document.getElementById('mobileMenuBtn')?.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });

    // Chat
    document.getElementById('chatToggleBtn')?.addEventListener('click', toggleChat);
    document.getElementById('chatCloseBtn')?.addEventListener('click', closeChat);
    document.getElementById('chatSendBtn')?.addEventListener('click', sendChatMessage);

    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
      chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendChatMessage();
        }
      });
      chatInput.addEventListener('input', () => autoResizeInput(chatInput));
    }

    // Quick actions in chat
    document.querySelectorAll('.quick-action').forEach((btn) => {
      btn.addEventListener('click', () => {
        const input = document.getElementById('chatInput');
        if (input) {
          input.value = btn.dataset.query;
          sendChatMessage();
        }
      });
    });

    // Notifications
    document.getElementById('notifBtn')?.addEventListener('click', toggleNotifications);
    document.getElementById('notifCloseBtn')?.addEventListener('click', () => {
      notifPanel.classList.remove('open');
      const notifBtn = document.getElementById('notifBtn');
      if (notifBtn) {
        notifBtn.setAttribute('aria-expanded', 'false');
        notifBtn.focus();
      }
    });

    // Settings
    document.getElementById('settingsBtn')?.addEventListener('click', openSettings);
    document.getElementById('settingsSave')?.addEventListener('click', saveSettings);
    document.getElementById('settingsCancel')?.addEventListener('click', closeSettings);

    // Close modal on overlay click
    settingsModal?.addEventListener('click', (e) => {
      if (e.target === settingsModal) closeSettings();
    });

    // Translator
    document.getElementById('translateBtn')?.addEventListener('click', handleTranslation);
    document.getElementById('langSwapBtn')?.addEventListener('click', swapLanguages);

    // Update phrase cards when language selection changes
    document.getElementById('langFrom')?.addEventListener('change', () => {
      const from = document.getElementById('langFrom').value;
      const to = document.getElementById('langTo').value;
      DashboardData.renderPhraseCards('phraseCards', from, to);
    });
    document.getElementById('langTo')?.addEventListener('change', () => {
      const from = document.getElementById('langFrom').value;
      const to = document.getElementById('langTo').value;
      DashboardData.renderPhraseCards('phraseCards', from, to);
    });

    // Keyboard shortcut: Escape to close panels
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeChat();
        notifPanel.classList.remove('open');
        closeSettings();
      }
    });

    // Click outside to close sidebar on mobile
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 1024 && sidebar.classList.contains('open')) {
        if (!sidebar.contains(e.target) && e.target.id !== 'mobileMenuBtn') {
          sidebar.classList.remove('open');
        }
      }
    });
  }

  // ---- Initialization ----
  function init() {
    // Initialize AI
    AIAssistant.init();

    // Bind all events
    bindEvents();

    // Set up WebSocket listeners
    setupWSListeners();

    // Render initial content
    const ticker = document.getElementById('tickerTrack');
    if (ticker) ticker.innerHTML = DashboardData.generateTickerHTML();

    // Render overview
    navigateTo('overview');

    // Render notifications
    DashboardData.renderNotifications('notifList');

    // Apply role visibility
    switchRole('fan');

    // Start live data updates (local simulation only)
    startDataRefresh();

    // Show welcome toast
    setTimeout(() => {
      showToast('Welcome to StadiumAI Hub! 🏟️ FIFA World Cup 2026', '⚽');
    }, 1000);

    // Periodic AI insight refresh
    setInterval(() => {
      refreshAIInsights();
    }, 30000);

    console.log('🏟️ StadiumAI Hub initialized — FIFA World Cup 2026');
  }

  // Refresh AI insight text with variations
  function refreshAIInsights() {
    const insights = {
      overview: [
        '<span class="insight-label">Real-time Analysis</span><strong>Gate A3 congestion detected.</strong> Crowd density in North Stand Zone B has increased 24% in the last 10 minutes. Recommend opening auxiliary Gate A4 and redirecting incoming fans via the East Concourse. Estimated relief time: 8 minutes.',
        '<span class="insight-label">Real-time Analysis</span><strong>Optimal flow detected on East side.</strong> Gates D and E are operating at 45-53% capacity. Recommend directing arriving fans to these entry points. Current bottleneck at Gate C predicted to clear in 6 minutes.',
        '<span class="insight-label">Real-time Analysis</span><strong>Concession surge incoming.</strong> Based on match pattern analysis (goal at 51\'), a 40% increase in concourse movement is predicted in the next 5 minutes. Pre-alert food service staff in zones B2-B4.',
      ],
      crowd: [
        '<span class="insight-label">AI Prediction</span><strong>Halftime surge expected in 12 minutes.</strong> Based on current match tempo and historical patterns, a 35% increase in concourse traffic is predicted. Food court zones C2-C4 will reach 90%+ capacity. Pre-positioning 6 additional staff to concessions recommended.',
        '<span class="insight-label">AI Prediction</span><strong>Post-goal movement wave detected.</strong> Following the 51st minute goal, a redistribution pattern is emerging. Sections B2-B4 seeing 15% density increase. Expected to normalize within 8 minutes.',
        '<span class="insight-label">AI Prediction</span><strong>Exit pattern pre-analysis.</strong> If the current score holds, early departures expected from 80th minute. Gate D and Lot C should prepare for increased outflow. Recommend pre-opening Lot E shuttle service at 78th minute.',
      ],
      operations: [
        '<span class="insight-label">Operations AI</span><strong>Priority redeployment needed.</strong> Medical incident in Section F requires 2 additional first responders. Nearest available: Team 7 (currently idle at Gate B, ETA 2 min) and Team 12 (post shift at Lot C, ETA 4 min). Auto-dispatching Team 7 with highest urgency.',
        '<span class="insight-label">Operations AI</span><strong>Maintenance escalation.</strong> Gate C-2 turnstile failure affecting throughput by ~200 fans/hour. Temporary manual processing activated. Repair ETA: 15 minutes. Adjacent gate C-3 handling overflow effectively.',
        '<span class="insight-label">Operations AI</span><strong>Staff rotation recommendation.</strong> Security Team 5 has been on continuous duty for 3.5 hours. Performance metrics suggest rotation. Standby Team 9 is ready for handover at Gate A in 10 minutes.',
      ],
    };

    Object.entries(insights).forEach(([section, texts]) => {
      const elId = 'aiInsight' + capitalize(section);
      const el = document.getElementById(elId);
      if (el) {
        const randomText = texts[Math.floor(Math.random() * texts.length)];
        el.innerHTML = randomText;
      }
    });
  }

  // ---- Public API ----
  window.app = {
    navigateTo,
    switchRole,
    showToast,
    toggleChat,
  };

  // ---- Boot ----
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
