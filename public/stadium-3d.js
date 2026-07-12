/* ============================================================
   StadiumAI Hub — 3D Stadium Visualization
   Three.js powered interactive 3D stadium model
   ============================================================ */

(function () {
  'use strict';

  class Stadium3D {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      if (!this.container) return;

      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.stadium = null;
      this.animationId = null;

      this.init();
    }

    init() {
      // Scene setup
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x05060f);

      // Camera setup
      const aspect = this.container.clientWidth / this.container.clientHeight;
      this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
      this.camera.position.set(0, 30, 50);
      this.camera.lookAt(0, 0, 0);

      // Renderer setup
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.container.appendChild(this.renderer.domElement);

      // Lighting
      this.setupLighting();

      // Create stadium
      this.createStadium();

      // Add controls
      this.addControls();

      // Handle resize
      window.addEventListener('resize', () => this.onResize());

      // Start animation
      this.animate();
    }

    setupLighting() {
      // Ambient light
      const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
      this.scene.add(ambientLight);

      // Main directional light
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(50, 100, 50);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      this.scene.add(directionalLight);

      // Accent lights
      const purpleLight = new THREE.PointLight(0x6c2bd9, 0.8, 100);
      purpleLight.position.set(-30, 20, -30);
      this.scene.add(purpleLight);

      const tealLight = new THREE.PointLight(0x0d9488, 0.8, 100);
      tealLight.position.set(30, 20, 30);
      this.scene.add(tealLight);

      const goldLight = new THREE.PointLight(0xf59e0b, 0.6, 100);
      goldLight.position.set(0, 30, 0);
      this.scene.add(goldLight);
    }

    createStadium() {
      this.stadium = new THREE.Group();

      // Stadium base/field
      const fieldGeometry = new THREE.CircleGeometry(25, 64);
      const fieldMaterial = new THREE.MeshStandardMaterial({
        color: 0x2d5a27,
        roughness: 0.8,
        metalness: 0.1,
      });
      const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
      field.rotation.x = -Math.PI / 2;
      field.receiveShadow = true;
      this.stadium.add(field);

      // Field lines
      this.addFieldLines();

      // Stadium stands - create 4 sections
      this.createStandSection(0, 0, -28, 0, 0, 0); // North
      this.createStandSection(0, 0, 28, 0, Math.PI, 0); // South
      this.createStandSection(-28, 0, 0, 0, Math.PI / 2, 0); // West
      this.createStandSection(28, 0, 0, 0, -Math.PI / 2, 0); // East

      // Stadium roof
      this.createRoof();

      // Corner towers
      this.createCornerTower(-25, 0, -25);
      this.createCornerTower(25, 0, -25);
      this.createCornerTower(-25, 0, 25);
      this.createCornerTower(25, 0, 25);

      // Add glowing particles for atmosphere
      this.addAtmosphericParticles();

      this.scene.add(this.stadium);
    }

    addFieldLines() {
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        opacity: 0.8,
        transparent: true,
      });

      // Center circle
      const circleGeometry = new THREE.CircleGeometry(9.15, 64);
      const circle = new THREE.Mesh(
        circleGeometry,
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          opacity: 0.3,
          transparent: true,
          side: THREE.DoubleSide,
        })
      );
      circle.rotation.x = -Math.PI / 2;
      circle.position.y = 0.01;
      this.stadium.add(circle);

      // Center line
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0.01, -25),
        new THREE.Vector3(0, 0.01, 25),
      ]);
      const centerLine = new THREE.Line(lineGeometry, lineMaterial);
      this.stadium.add(centerLine);

      // Penalty areas
      this.createPenaltyArea(0, 0, -16, lineMaterial);
      this.createPenaltyArea(0, 0, 16, lineMaterial);
    }

    createPenaltyArea(x, y, z, material) {
      const width = 40.32;
      const height = 16.5;

      const points = [
        new THREE.Vector3(-width / 2, 0.01, z),
        new THREE.Vector3(-width / 2, 0.01, z + (z > 0 ? -height : height)),
        new THREE.Vector3(width / 2, 0.01, z + (z > 0 ? -height : height)),
        new THREE.Vector3(width / 2, 0.01, z),
      ];

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, material);
      this.stadium.add(line);
    }

    createStandSection(x, y, z, rotationX, rotationY, rotationZ) {
      const standGroup = new THREE.Group();

      // Tier 1
      const tier1Geometry = new THREE.BoxGeometry(50, 8, 10);
      const tier1Material = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        roughness: 0.7,
        metalness: 0.3,
      });
      const tier1 = new THREE.Mesh(tier1Geometry, tier1Material);
      tier1.position.y = 4;
      tier1.castShadow = true;
      tier1.receiveShadow = true;
      standGroup.add(tier1);

      // Tier 2
      const tier2Geometry = new THREE.BoxGeometry(45, 6, 8);
      const tier2 = new THREE.Mesh(tier2Geometry, tier1Material);
      tier2.position.y = 11;
      tier2.castShadow = true;
      tier2.receiveShadow = true;
      standGroup.add(tier2);

      // Tier 3 (VIP)
      const tier3Geometry = new THREE.BoxGeometry(40, 5, 6);
      const tier3Material = new THREE.MeshStandardMaterial({
        color: 0x6c2bd9,
        roughness: 0.5,
        metalness: 0.5,
        emissive: 0x6c2bd9,
        emissiveIntensity: 0.1,
      });
      const tier3 = new THREE.Mesh(tier3Geometry, tier3Material);
      tier3.position.y = 16.5;
      tier3.castShadow = true;
      tier3.receiveShadow = true;
      standGroup.add(tier3);

      // Seats (represented as small boxes)
      this.addSeats(standGroup, 48, 8, 0, 4, 10);
      this.addSeats(standGroup, 43, 6, 0, 11, 8);

      standGroup.position.set(x, y, z);
      standGroup.rotation.set(rotationX, rotationY, rotationZ);
      this.stadium.add(standGroup);
    }

    addSeats(parent, width, height, yOffset, yPosition, depth) {
      const seatGeometry = new THREE.BoxGeometry(0.8, 0.5, 0.8);
      const seatColors = [0x6c2bd9, 0x0d9488, 0xf59e0b, 0x3b82f6];

      for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
          const seatMaterial = new THREE.MeshStandardMaterial({
            color: seatColors[Math.floor(Math.random() * seatColors.length)],
            roughness: 0.8,
            metalness: 0.2,
          });
          const seat = new THREE.Mesh(seatGeometry, seatMaterial);
          seat.position.set(-width / 2 + col * 1 + 0.5, yPosition + row * 0.8, depth / 2 + 0.5);
          seat.castShadow = true;
          parent.add(seat);
        }
      }
    }

    createRoof() {
      const roofGroup = new THREE.Group();

      // Main roof structure
      const roofGeometry = new THREE.CylinderGeometry(35, 30, 5, 64, 1, true);
      const roofMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        roughness: 0.6,
        metalness: 0.4,
        side: THREE.DoubleSide,
      });
      const roof = new THREE.Mesh(roofGeometry, roofMaterial);
      roof.position.y = 22;
      roof.castShadow = true;
      roofGroup.add(roof);

      // Roof supports
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const supportGeometry = new THREE.CylinderGeometry(0.5, 0.5, 20, 16);
        const support = new THREE.Mesh(supportGeometry, roofMaterial);
        support.position.set(Math.cos(angle) * 30, 12, Math.sin(angle) * 30);
        support.castShadow = true;
        roofGroup.add(support);
      }

      // LED strip lights on roof edge
      const ledGeometry = new THREE.TorusGeometry(35, 0.3, 16, 100);
      const ledMaterial = new THREE.MeshBasicMaterial({
        color: 0x6c2bd9,
        transparent: true,
        opacity: 0.8,
      });
      const ledStrip = new THREE.Mesh(ledGeometry, ledMaterial);
      ledStrip.rotation.x = Math.PI / 2;
      ledStrip.position.y = 24;
      roofGroup.add(ledStrip);

      this.stadium.add(roofGroup);
    }

    createCornerTower(x, y, z) {
      const towerGroup = new THREE.Group();

      // Tower base
      const baseGeometry = new THREE.CylinderGeometry(3, 4, 25, 8);
      const towerMaterial = new THREE.MeshStandardMaterial({
        color: 0x2d2d4a,
        roughness: 0.6,
        metalness: 0.4,
      });
      const base = new THREE.Mesh(baseGeometry, towerMaterial);
      base.position.y = 12.5;
      base.castShadow = true;
      towerGroup.add(base);

      // Tower top (light)
      const topGeometry = new THREE.SphereGeometry(2, 16, 16);
      const topMaterial = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0.9,
      });
      const top = new THREE.Mesh(topGeometry, topMaterial);
      top.position.y = 27;
      towerGroup.add(top);

      // Point light
      const towerLight = new THREE.PointLight(0xf59e0b, 1, 50);
      towerLight.position.y = 27;
      towerGroup.add(towerLight);

      towerGroup.position.set(x, y, z);
      this.stadium.add(towerGroup);
    }

    addAtmosphericParticles() {
      const particleCount = 500;
      const particleGeometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);

      const colorOptions = [
        new THREE.Color(0x6c2bd9),
        new THREE.Color(0x0d9488),
        new THREE.Color(0xf59e0b),
        new THREE.Color(0x3b82f6),
      ];

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 1] = Math.random() * 50;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

        const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
      }

      particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const particleMaterial = new THREE.PointsMaterial({
        size: 0.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
      });

      this.particles = new THREE.Points(particleGeometry, particleMaterial);
      this.scene.add(this.particles);
    }

    addControls() {
      // Simple mouse interaction for rotation
      let isDragging = false;
      let previousMousePosition = { x: 0, y: 0 };

      this.container.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
      });

      this.container.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        this.stadium.rotation.y += deltaX * 0.01;
        this.stadium.rotation.x += deltaY * 0.005;

        previousMousePosition = { x: e.clientX, y: e.clientY };
      });

      this.container.addEventListener('mouseup', () => {
        isDragging = false;
      });

      this.container.addEventListener('mouseleave', () => {
        isDragging = false;
      });

      // Zoom with scroll
      this.container.addEventListener('wheel', (e) => {
        e.preventDefault();
        this.camera.position.z += e.deltaY * 0.05;
        this.camera.position.z = Math.max(30, Math.min(80, this.camera.position.z));
      });
    }

    onResize() {
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(width, height);
    }

    animate() {
      this.animationId = requestAnimationFrame(() => this.animate());

      // Slow rotation when not interacting
      if (this.stadium) {
        this.stadium.rotation.y += 0.001;
      }

      // Animate particles
      if (this.particles) {
        this.particles.rotation.y += 0.0005;
        const positions = this.particles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i + 1] += Math.sin(Date.now() * 0.001 + i) * 0.02;
        }
        this.particles.geometry.attributes.position.needsUpdate = true;
      }

      this.renderer.render(this.scene, this.camera);
    }

    destroy() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
      if (this.renderer) {
        this.renderer.dispose();
        this.container.removeChild(this.renderer.domElement);
      }
    }
  }

  // Export for use in app
  window.Stadium3D = Stadium3D;
})();
