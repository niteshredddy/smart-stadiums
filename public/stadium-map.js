/* ============================================================
   StadiumAI Hub — Interactive Stadium Map
   SVG-based stadium rendering with zone interactivity,
   crowd density overlay, and point-of-interest markers
   ============================================================ */

const StadiumMap = (() => {
  let selectedZone = null;

  // Generate the stadium SVG
  function render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const w = 560;
    const h = 420;
    const cx = w / 2;
    const cy = h / 2;

    // Oval stadium shape parameters
    const outerRx = 250, outerRy = 185;
    const innerRx = 140, innerRy = 95;
    const fieldRx = 115, fieldRy = 72;

    // Build zones as arc segments
    const numSegments = 16;
    const zones = CrowdData.getAllZones();

    let zonesHTML = '';
    for (let i = 0; i < numSegments; i++) {
      const angle1 = (i / numSegments) * 2 * Math.PI - Math.PI / 2;
      const angle2 = ((i + 1) / numSegments) * 2 * Math.PI - Math.PI / 2;

      // Outer arc
      const ox1 = cx + outerRx * Math.cos(angle1);
      const oy1 = cy + outerRy * Math.sin(angle1);
      const ox2 = cx + outerRx * Math.cos(angle2);
      const oy2 = cy + outerRy * Math.sin(angle2);

      // Inner arc
      const ix1 = cx + innerRx * Math.cos(angle1);
      const iy1 = cy + innerRy * Math.sin(angle1);
      const ix2 = cx + innerRx * Math.cos(angle2);
      const iy2 = cy + innerRy * Math.sin(angle2);

      const largeArc = (angle2 - angle1) > Math.PI ? 1 : 0;

      // Map to a zone
      const zoneIdx = i % zones.length;
      const zone = zones[zoneIdx];
      const density = zone ? zone.density : 50;
      const fill = getDensityColor(density);
      const section = zone ? zone.section : `S${i + 1}`;

      // Label position
      const midAngle = (angle1 + angle2) / 2;
      const labelR = (outerRx + innerRx) / 2;
      const labelRy = (outerRy + innerRy) / 2;
      const lx = cx + (labelR * 0.95) * Math.cos(midAngle);
      const ly = cy + (labelRy * 0.95) * Math.sin(midAngle);

      const path = `M ${ox1} ${oy1} A ${outerRx} ${outerRy} 0 ${largeArc} 1 ${ox2} ${oy2} L ${ix2} ${iy2} A ${innerRx} ${innerRy} 0 ${largeArc} 0 ${ix1} ${iy1} Z`;

      zonesHTML += `
        <path class="zone" d="${path}" fill="${fill}" data-zone-idx="${zoneIdx}" data-section="${section}" />
        <text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" 
              fill="rgba(255,255,255,0.8)" font-size="10" font-weight="600" font-family="Inter, sans-serif"
              pointer-events="none">${section}</text>
      `;
    }

    // Gate labels
    const gatePositions = [
      { angle: -Math.PI / 2, label: 'Gate A' },
      { angle: 0, label: 'Gate B' },
      { angle: Math.PI / 2, label: 'Gate C' },
      { angle: Math.PI, label: 'Gate D' },
    ];

    let gatesHTML = gatePositions.map(g => {
      const gx = cx + (outerRx + 22) * Math.cos(g.angle);
      const gy = cy + (outerRy + 22) * Math.sin(g.angle);
      return `
        <text x="${gx}" y="${gy}" text-anchor="middle" dominant-baseline="middle"
              fill="var(--accent-400)" font-size="11" font-weight="700" font-family="Outfit, sans-serif">
          ${g.label}
        </text>
      `;
    }).join('');

    // POI markers on the map
    const pois = [
      { angle: -0.3, r: 0.75, icon: '🍔', label: 'Food' },
      { angle: 1.2, r: 0.78, icon: '🚻', label: 'WC' },
      { angle: 2.5, r: 0.72, icon: '🏥', label: 'First Aid' },
      { angle: -1.8, r: 0.80, icon: '♿', label: 'Access' },
      { angle: 0.7, r: 0.76, icon: '🛍️', label: 'Shop' },
    ];

    let poisHTML = pois.map(p => {
      const px = cx + (outerRx * p.r) * Math.cos(p.angle);
      const py = cy + (outerRy * p.r) * Math.sin(p.angle);
      return `
        <g class="poi-marker" style="cursor:pointer;">
          <circle cx="${px}" cy="${py}" r="12" fill="rgba(0,0,0,0.6)" stroke="var(--glass-border)" stroke-width="1"/>
          <text x="${px}" y="${py + 1}" text-anchor="middle" dominant-baseline="middle" font-size="12">${p.icon}</text>
        </g>
      `;
    }).join('');

    const svg = `
      <svg class="stadium-svg" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="fieldGrad" cx="50%" cy="50%">
            <stop offset="0%" stop-color="#15803d" />
            <stop offset="100%" stop-color="#166534" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <!-- Stadium background ring -->
        <ellipse cx="${cx}" cy="${cy}" rx="${outerRx + 5}" ry="${outerRy + 5}" 
                 fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="10"/>

        <!-- Zones -->
        ${zonesHTML}

        <!-- Field -->
        <ellipse cx="${cx}" cy="${cy}" rx="${fieldRx}" ry="${fieldRy}" fill="url(#fieldGrad)" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>

        <!-- Field markings -->
        <ellipse cx="${cx}" cy="${cy}" rx="${fieldRx}" ry="${fieldRy}" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
        <line x1="${cx}" y1="${cy - fieldRy}" x2="${cx}" y2="${cy + fieldRy}" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
        <circle cx="${cx}" cy="${cy}" r="18" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
        <circle cx="${cx}" cy="${cy}" r="2" fill="rgba(255,255,255,0.3)"/>

        <!-- Penalty areas -->
        <rect x="${cx - fieldRx}" y="${cy - 25}" width="30" height="50" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" rx="2"/>
        <rect x="${cx + fieldRx - 30}" y="${cy - 25}" width="30" height="50" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" rx="2"/>

        <!-- FIFA text -->
        <text x="${cx}" y="${cy + 3}" text-anchor="middle" dominant-baseline="middle"
              fill="rgba(255,255,255,0.12)" font-size="18" font-weight="800" font-family="Outfit, sans-serif"
              letter-spacing="8">FIFA 2026</text>

        <!-- Gate labels -->
        ${gatesHTML}

        <!-- POI markers -->
        ${poisHTML}
      </svg>
    `;

    container.innerHTML = svg;

    // Add zone click handlers
    container.querySelectorAll('.zone').forEach(zoneEl => {
      zoneEl.addEventListener('click', () => {
        // Remove previous selection
        container.querySelectorAll('.zone.selected').forEach(el => el.classList.remove('selected'));
        zoneEl.classList.add('selected');

        const idx = parseInt(zoneEl.dataset.zoneIdx);
        const zone = CrowdData.getAllZones()[idx];
        if (zone) showZoneInfo(zone);
      });
    });
  }

  // Get color for density percentage
  function getDensityColor(pct) {
    if (pct <= 30) return 'rgba(34, 197, 94, 0.3)';
    if (pct <= 50) return 'rgba(34, 197, 94, 0.5)';
    if (pct <= 65) return 'rgba(245, 158, 11, 0.4)';
    if (pct <= 75) return 'rgba(245, 158, 11, 0.6)';
    if (pct <= 85) return 'rgba(239, 68, 68, 0.4)';
    if (pct <= 95) return 'rgba(239, 68, 68, 0.65)';
    return 'rgba(239, 68, 68, 0.85)';
  }

  // Show zone detail panel
  function showZoneInfo(zone) {
    const panel = document.getElementById('zoneInfoPanel');
    if (!panel) return;

    const occupied = Math.round(zone.capacity * zone.density / 100);
    const status = CrowdData.getAlertStatus(zone.density);
    const statusColors = {
      safe: 'var(--success)',
      warning: 'var(--warning)',
      critical: 'var(--danger)'
    };

    panel.innerHTML = `
      <div class="zone-info-title" style="color:${statusColors[status]}">
        📍 ${zone.name}
      </div>
      <div class="zone-stat">
        <span class="zone-stat-label">Density</span>
        <span class="zone-stat-value" style="color:${statusColors[status]}">${zone.density}%</span>
      </div>
      <div class="zone-stat">
        <span class="zone-stat-label">Occupancy</span>
        <span class="zone-stat-value">${occupied} / ${zone.capacity}</span>
      </div>
      <div class="zone-stat">
        <span class="zone-stat-label">Status</span>
        <span class="zone-stat-value" style="color:${statusColors[status]};text-transform:capitalize;">${status}</span>
      </div>
      <div class="zone-stat">
        <span class="zone-stat-label">Trend</span>
        <span class="zone-stat-value">${zone.trend === 'up' ? '📈 Increasing' : '📉 Decreasing'}</span>
      </div>
      <div class="zone-stat">
        <span class="zone-stat-label">Nearest Exit</span>
        <span class="zone-stat-value">Gate ${zone.section.charAt(0)}</span>
      </div>
      <div class="ai-insight mt-4" style="font-size:0.78rem;">
        <span class="insight-label">AI Note</span>
        ${status === 'critical' 
          ? `<strong>Action required.</strong> This zone exceeds safe density thresholds. Consider redirecting incoming fans to adjacent sections or opening additional access points.`
          : status === 'warning'
          ? `<strong>Monitor closely.</strong> Density is approaching threshold levels. Pre-position crowd management staff for potential intervention.`
          : `<strong>Normal operations.</strong> Crowd flow is healthy in this zone. No intervention needed.`
        }
      </div>
    `;

    selectedZone = zone;
  }

  // Update map colors based on current density
  function updateColors(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const zones = CrowdData.getAllZones();
    container.querySelectorAll('.zone').forEach(zoneEl => {
      const idx = parseInt(zoneEl.dataset.zoneIdx);
      if (zones[idx]) {
        zoneEl.setAttribute('fill', getDensityColor(zones[idx].density));
      }
    });
  }

  return {
    render,
    updateColors,
    getDensityColor,
    showZoneInfo,
  };
})();
