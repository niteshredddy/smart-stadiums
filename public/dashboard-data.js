/* ============================================================
   StadiumAI Hub — Dashboard Data Simulation
   Realistic data generation for sustainability, transport,
   operations, match schedule, and notifications
   ============================================================ */

const DashboardData = (() => {
  // ---- Match Schedule & Ticker ----
  const matches = [
    { team1: '🇧🇷 Brazil', team2: '🇩🇪 Germany', score: '2 - 1', time: "67'", status: 'live', venue: 'MetLife Stadium' },
    { team1: '🇦🇷 Argentina', team2: '🇫🇷 France', score: '1 - 1', time: "54'", status: 'live', venue: 'SoFi Stadium' },
    { team1: '🇺🇸 USA', team2: '🇲🇽 Mexico', score: '0 - 0', time: '18:00', status: 'upcoming', venue: 'AT&T Stadium' },
    { team1: '🇪🇸 Spain', team2: '🇳🇱 Netherlands', score: '3 - 0', time: 'FT', status: 'finished', venue: 'Hard Rock Stadium' },
    { team1: '🇬🇧 England', team2: '🇵🇹 Portugal', score: '1 - 2', time: 'FT', status: 'finished', venue: 'Lincoln Financial' },
    { team1: '🇯🇵 Japan', team2: '🇰🇷 S. Korea', score: '0 - 0', time: '20:00', status: 'upcoming', venue: 'Lumen Field' },
    { team1: '🇮🇹 Italy', team2: '🇭🇷 Croatia', score: '2 - 2', time: "88'", status: 'live', venue: 'Mercedes-Benz' },
    { team1: '🇳🇬 Nigeria', team2: '🇸🇳 Senegal', score: '1 - 0', time: "32'", status: 'live', venue: 'NRG Stadium' },
  ];

  function getMatches() { return matches; }

  function generateTickerHTML() {
    let html = '';
    // Duplicate for infinite scroll
    for (let r = 0; r < 2; r++) {
      matches.forEach(m => {
        const statusTag = m.status === 'live'
          ? `<span class="ticker-live">LIVE</span>`
          : '';
        html += `
          <div class="ticker-item">
            ${statusTag}
            <span>${m.team1}</span>
            <span class="ticker-score">${m.score}</span>
            <span>${m.team2}</span>
            <span class="ticker-time">${m.time}</span>
          </div>
        `;
      });
    }
    return html;
  }

  // ---- Gate Utilization ----
  const gates = [
    { name: 'Gate A', utilization: 87, status: 'active' },
    { name: 'Gate B', utilization: 62, status: 'active' },
    { name: 'Gate C', utilization: 94, status: 'active' },
    { name: 'Gate D', utilization: 45, status: 'active' },
    { name: 'Gate E', utilization: 78, status: 'active' },
    { name: 'Gate F', utilization: 53, status: 'active' },
    { name: 'Gate G', utilization: 71, status: 'active' },
  ];

  function getGates() { return gates; }

  function renderGateBars(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = gates.map(g => {
      const color = g.utilization > 85 ? 'var(--danger)' :
                    g.utilization > 65 ? 'var(--warning)' :
                    'var(--success)';
      return `
        <div class="gate-bar-row">
          <span class="gate-label">${g.name}</span>
          <div class="gate-bar">
            <div class="gate-fill" style="width:${g.utilization}%;background:${color};"></div>
          </div>
          <span class="gate-percent" style="color:${color};">${g.utilization}%</span>
        </div>
      `;
    }).join('');
  }

  // ---- Parking ----
  const parkingLots = [
    { name: 'Lot A (VIP)', capacity: 500, occupied: 420 },
    { name: 'Lot B (North)', capacity: 2000, occupied: 1640 },
    { name: 'Lot C (East)', capacity: 1500, occupied: 510 },
    { name: 'Lot D (South)', capacity: 1800, occupied: 1350 },
    { name: 'Lot E (Remote)', capacity: 3000, occupied: 980 },
  ];

  function renderParkingBars(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = parkingLots.map(p => {
      const pct = Math.round((p.occupied / p.capacity) * 100);
      const avail = p.capacity - p.occupied;
      const color = pct > 85 ? 'var(--danger)' :
                    pct > 65 ? 'var(--warning)' :
                    'var(--success)';
      return `
        <div class="gate-bar-row">
          <span class="gate-label" style="width:110px;">${p.name}</span>
          <div class="gate-bar">
            <div class="gate-fill" style="width:${pct}%;background:${color};">${pct > 30 ? avail + ' spots' : ''}</div>
          </div>
          <span class="gate-percent" style="color:${color};">${pct}%</span>
        </div>
      `;
    }).join('');
  }

  // ---- Incidents ----
  const incidents = [
    {
      id: 'INC-001',
      title: 'Medical assistance required — Section F Row 22',
      severity: 'critical',
      time: '2 min ago',
      zone: 'Section F',
      assignee: 'Team 7'
    },
    {
      id: 'INC-002',
      title: 'Overcrowding alert at Food Court North',
      severity: 'warning',
      time: '8 min ago',
      zone: 'Concourse B',
      assignee: 'Crowd Ops'
    },
    {
      id: 'INC-003',
      title: 'Broken turnstile at Gate C-2',
      severity: 'warning',
      time: '15 min ago',
      zone: 'Gate C',
      assignee: 'Maintenance'
    },
    {
      id: 'INC-004',
      title: 'Lost child reported near Gate A lobby',
      severity: 'critical',
      time: '18 min ago',
      zone: 'Gate A',
      assignee: 'Security Team 3'
    },
    {
      id: 'INC-005',
      title: 'WiFi connectivity issues in East Stand',
      severity: 'info',
      time: '25 min ago',
      zone: 'East Stand',
      assignee: 'IT Support'
    },
    {
      id: 'INC-006',
      title: 'VIP suite catering delay — Suite Level 3',
      severity: 'info',
      time: '30 min ago',
      zone: 'Suite Level',
      assignee: 'Hospitality'
    },
    {
      id: 'INC-007',
      title: 'Lighting fault in Parking Lot B',
      severity: 'resolved',
      time: '45 min ago',
      zone: 'Lot B',
      assignee: 'Electricians'
    },
    {
      id: 'INC-008',
      title: 'Unauthorized access attempt — Media Zone',
      severity: 'resolved',
      time: '1 hr ago',
      zone: 'Media Zone',
      assignee: 'Security'
    },
  ];

  function renderIncidents(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = incidents.map(i => `
      <div class="incident-item">
        <div class="incident-severity ${i.severity}"></div>
        <div class="incident-content">
          <div class="incident-title">${i.title}</div>
          <div class="incident-meta">
            <span>🕐 ${i.time}</span>
            <span>📍 ${i.zone}</span>
            <span>👤 ${i.assignee}</span>
          </div>
        </div>
        <button class="incident-action">${i.severity === 'resolved' ? '✓ Closed' : 'Manage'}</button>
      </div>
    `).join('');
  }

  // ---- Staff Deployment ----
  const staffDeploy = [
    { role: 'Security', count: 124, status: 'active' },
    { role: 'Medical', count: 28, status: 'active' },
    { role: 'Stewards', count: 86, status: 'active' },
    { role: 'Volunteers', count: 64, status: 'active' },
    { role: 'Maintenance', count: 22, status: 'standby' },
    { role: 'IT Support', count: 18, status: 'standby' },
  ];

  function renderStaffGrid(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = staffDeploy.map(s => `
      <div class="staff-card">
        <div class="staff-count">${s.count}</div>
        <div class="staff-role">${s.role}</div>
        <span class="staff-status ${s.status}">${s.status === 'active' ? '● Active' : '○ Standby'}</span>
      </div>
    `).join('');
  }

  // ---- Notifications ----
  const notifications = [
    { title: '🚨 Medical Alert', desc: 'First aid requested in Section F Row 22. Team 7 dispatched.', time: '2 min ago' },
    { title: '⚠️ Crowd Alert', desc: 'Food Court North reaching 90% capacity. Redirecting flow.', time: '5 min ago' },
    { title: '🎯 Goal!', desc: 'Brazil scored! Crowd movement expected in concourse areas.', time: '8 min ago' },
    { title: '🅿️ Parking Update', desc: 'Lot A (VIP) is now 84% full. Redirecting to Lot C.', time: '12 min ago' },
    { title: '🌡️ Weather Update', desc: 'Temperature dropping to 72°F. Roof panels adjusted.', time: '20 min ago' },
    { title: '✅ Incident Resolved', desc: 'Parking Lot B lighting has been restored.', time: '45 min ago' },
  ];

  function renderNotifications(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = notifications.map(n => `
      <div class="notif-item">
        <div class="notif-item-title">${n.title}</div>
        <div class="notif-item-desc">${n.desc}</div>
        <div class="notif-item-time">${n.time}</div>
      </div>
    `).join('');
  }

  // ---- Quick Phrases for Translator ----
  const phrases = {
    en: [
      { text: 'Where is my seat?', context: 'Finding your seating section' },
      { text: 'Where is the nearest restroom?', context: 'Locating facilities' },
      { text: 'I need medical help', context: 'Emergency situation' },
      { text: 'How do I get to Gate B?', context: 'Stadium navigation' },
      { text: 'Where can I buy food?', context: 'Finding concessions' },
      { text: 'What time does the match start?', context: 'Match schedule' },
      { text: 'Is there wheelchair access?', context: 'Accessibility' },
      { text: 'Where is the fan zone?', context: 'Entertainment areas' },
    ],
    es: [
      { text: '¿Dónde está mi asiento?', context: 'Encontrar sección' },
      { text: '¿Dónde está el baño más cercano?', context: 'Encontrar instalaciones' },
      { text: 'Necesito ayuda médica', context: 'Situación de emergencia' },
      { text: '¿Cómo llego a la Puerta B?', context: 'Navegación del estadio' },
      { text: '¿Dónde puedo comprar comida?', context: 'Encontrar concesiones' },
      { text: '¿A qué hora empieza el partido?', context: 'Horario del partido' },
      { text: '¿Hay acceso para silla de ruedas?', context: 'Accesibilidad' },
      { text: '¿Dónde está la zona de aficionados?', context: 'Áreas de entretenimiento' },
    ],
    fr: [
      { text: 'Où est ma place ?', context: 'Trouver votre section' },
      { text: 'Où sont les toilettes ?', context: 'Localiser les installations' },
      { text: "J'ai besoin d'aide médicale", context: "Situation d'urgence" },
      { text: 'Comment aller à la Porte B ?', context: 'Navigation du stade' },
      { text: 'Où acheter de la nourriture ?', context: 'Trouver les concessions' },
      { text: 'À quelle heure commence le match ?', context: 'Horaire du match' },
      { text: 'Y a-t-il un accès fauteuil roulant ?', context: 'Accessibilité' },
      { text: 'Où est la fan zone ?', context: 'Zones de divertissement' },
    ],
    ar: [
      { text: 'أين مقعدي؟', context: 'العثور على مقعدك' },
      { text: 'أين أقرب دورة مياه؟', context: 'تحديد المرافق' },
      { text: 'أحتاج مساعدة طبية', context: 'حالة طوارئ' },
      { text: 'كيف أصل إلى البوابة ب؟', context: 'التنقل في الملعب' },
      { text: 'أين يمكنني شراء الطعام؟', context: 'العثور على الطعام' },
      { text: 'متى تبدأ المباراة؟', context: 'جدول المباريات' },
      { text: 'هل يوجد وصول لذوي الاحتياجات؟', context: 'إمكانية الوصول' },
      { text: 'أين منطقة المشجعين؟', context: 'مناطق الترفيه' },
    ],
  };

  function renderPhraseCards(containerId, fromLang, toLang) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const fromPhrases = phrases[fromLang] || phrases.en;
    const toPhrases = phrases[toLang] || phrases.es;

    container.innerHTML = fromPhrases.map((p, i) => {
      const translated = toPhrases[i] ? toPhrases[i].text : '...';
      return `
        <div class="phrase-card" onclick="document.getElementById('translatorInput').value='${p.text.replace(/'/g, "\\'")}';document.getElementById('translatorOutput').value='${translated.replace(/'/g, "\\'")}'" >
          <div class="phrase-original">${p.text}</div>
          <div class="phrase-translated">${translated}</div>
          <div class="phrase-context">📌 ${p.context}</div>
        </div>
      `;
    }).join('');
  }

  // ---- Dynamic Data Updates ----
  function randomFluctuation(base, range) {
    return base + Math.floor(Math.random() * range * 2) - range;
  }

  function updateOverviewStats() {
    const attendance = randomFluctuation(67842, 200);
    const waitTime = (randomFluctuation(42, 8) / 10).toFixed(1);
    const queries = randomFluctuation(2847, 50);

    const el1 = document.getElementById('statAttendance');
    const el2 = document.getElementById('statWaitTime');
    const el3 = document.getElementById('statQueries');

    if (el1) el1.textContent = attendance.toLocaleString();
    if (el2) el2.textContent = waitTime + 'm';
    if (el3) el3.textContent = queries.toLocaleString();
  }

  function updateGates() {
    gates.forEach(g => {
      g.utilization = Math.max(20, Math.min(98, g.utilization + Math.floor(Math.random() * 7) - 3));
    });
  }

  function updateParkingLots() {
    parkingLots.forEach(p => {
      p.occupied = Math.max(50, Math.min(p.capacity - 20, p.occupied + Math.floor(Math.random() * 30) - 10));
    });
  }

  return {
    getMatches,
    generateTickerHTML,
    getGates,
    renderGateBars,
    renderParkingBars,
    renderIncidents,
    renderStaffGrid,
    renderNotifications,
    renderPhraseCards,
    updateOverviewStats,
    updateGates,
    updateParkingLots,
    phrases,
  };
})();
