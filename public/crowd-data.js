/* ============================================================
   StadiumAI Hub — Crowd Intelligence Data Engine
   Realistic crowd density simulation with time-based patterns,
   zone management, and alert detection
   ============================================================ */

const CrowdData = (() => {
  // Stadium zones configuration
  const zones = [];
  const ROWS = 6;
  const COLS = 8;
  const TOTAL_ZONES = ROWS * COLS;

  // Zone naming convention
  const sectionNames = ['A', 'B', 'C', 'D', 'E', 'F'];
  const levelNames = ['Lower', 'Lower', 'Mid', 'Mid', 'Upper', 'Upper'];

  // Initialize zones with realistic base densities
  function initZones() {
    zones.length = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const idx = r * COLS + c;
        // Central zones tend to be more crowded
        const centralBias = 1 - (Math.abs(c - 3.5) / 4) * 0.3;
        // Lower stands are typically more full
        const levelBias = r < 2 ? 1.0 : r < 4 ? 0.85 : 0.7;
        // Base density between 30-95%
        const baseDensity = Math.floor((40 + Math.random() * 55) * centralBias * levelBias);

        zones.push({
          id: `zone-${r}-${c}`,
          row: r,
          col: c,
          section: `${sectionNames[r]}${c + 1}`,
          level: levelNames[r],
          density: Math.min(98, Math.max(5, baseDensity)),
          capacity: 800 + Math.floor(Math.random() * 600),
          trend: Math.random() > 0.5 ? 'up' : 'down',
          name: `${levelNames[r]} Stand — Section ${sectionNames[r]}${c + 1}`,
        });
      }
    }
  }

  initZones();

  // Get density level (0-8) from percentage
  function getDensityLevel(pct) {
    if (pct <= 10) return 0;
    if (pct <= 25) return 1;
    if (pct <= 40) return 2;
    if (pct <= 50) return 3;
    if (pct <= 60) return 4;
    if (pct <= 70) return 5;
    if (pct <= 80) return 6;
    if (pct <= 90) return 7;
    return 8;
  }

  // Get alert status
  function getAlertStatus(pct) {
    if (pct >= 90) return 'critical';
    if (pct >= 75) return 'warning';
    return 'safe';
  }

  // Render heatmap to a container
  function renderHeatmap(containerId) {
    const html = zones
      .map((z) => {
        const level = getDensityLevel(z.density);
        const occupied = Math.round((z.capacity * z.density) / 100);
        return `
        <div class="heatmap-cell density-${level}" 
             data-zone-id="${z.id}" 
             data-section="${z.section}"
             title="${z.name}: ${z.density}%">
          <div class="tooltip">
            <strong>${z.section}</strong> — ${z.level}<br>
            Density: ${z.density}%<br>
            ${occupied}/${z.capacity} people
          </div>
        </div>
      `;
      })
      .join('');
    Utils.updateHTML(containerId, html);
  }

  // Simulate density changes
  function updateDensities() {
    zones.forEach((z) => {
      // Random walk with mean reversion
      const change = Math.random() * 8 - 4;
      const meanTarget = 65; // target average
      const reversion = (meanTarget - z.density) * 0.05;
      z.density = Math.min(98, Math.max(5, Math.round(z.density + change + reversion)));

      // Update trend
      if (change > 1) z.trend = 'up';
      else if (change < -1) z.trend = 'down';
    });
  }

  // Get aggregate stats
  function getStats() {
    let safe = 0,
      warning = 0,
      critical = 0,
      total = 0;
    zones.forEach((z) => {
      total += z.density;
      const status = getAlertStatus(z.density);
      if (status === 'critical') critical++;
      else if (status === 'warning') warning++;
      else safe++;
    });

    return {
      safe,
      warning,
      critical,
      avgDensity: Math.round(total / zones.length),
      totalZones: zones.length,
      hasAlerts: critical > 0,
    };
  }

  // Update stats display
  function updateStatsDisplay() {
    const stats = getStats();

    Utils.updateText('safeZones', stats.safe);
    Utils.updateText('warningZones', stats.warning);
    Utils.updateText('criticalZones', stats.critical);
    Utils.updateText('avgDensity', stats.avgDensity + '%');

    const badge = document.getElementById('crowdAlertBadge');
    if (badge) {
      if (stats.critical > 0) {
        badge.style.display = 'inline';
        badge.textContent = stats.critical;
      } else {
        badge.style.display = 'none';
      }
    }
  }

  // Get zone by ID
  function getZone(zoneId) {
    return zones.find((z) => z.id === zoneId);
  }

  // Get zone by section
  function getZoneBySection(section) {
    return zones.find((z) => z.section === section);
  }

  // Get all zones
  function getAllZones() {
    return [...zones];
  }

  // Get hotspot zones (critical density)
  function getHotspots() {
    return zones.filter((z) => z.density >= 85).sort((a, b) => b.density - a.density);
  }

  // Generate crowd context for AI
  function getCrowdContext() {
    const stats = getStats();
    const hotspots = getHotspots();
    let context = `Current crowd status: Average density ${stats.avgDensity}%. `;
    context += `${stats.safe} safe zones, ${stats.warning} warning zones, ${stats.critical} critical zones. `;

    if (hotspots.length > 0) {
      context += `Hotspots: ${hotspots
        .slice(0, 3)
        .map((z) => `${z.section} (${z.density}%)`)
        .join(', ')}. `;
    }

    return context;
  }

  return {
    initZones,
    renderHeatmap,
    updateDensities,
    getStats,
    updateStatsDisplay,
    getZone,
    getZoneBySection,
    getAllZones,
    getHotspots,
    getCrowdContext,
    getDensityLevel,
    getAlertStatus,
    ROWS,
    COLS,
  };
})();
