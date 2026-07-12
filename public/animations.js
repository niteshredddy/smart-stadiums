/* ============================================================
   StadiumAI Hub — Advanced Animations & Effects
   GSAP animations, particle effects, and micro-interactions
   ============================================================ */

(function () {
  'use strict';

  // Register GSAP plugins
  gsap.registerPlugin(ScrollTrigger);

  // Particle System
  class ParticleSystem {
    constructor(container) {
      this.container = container;
      this.particles = [];
      this.maxParticles = 100;
      this.init();
    }

    init() {
      const canvas = document.createElement('canvas');
      canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
      `;
      this.container.appendChild(canvas);
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.resize();

      window.addEventListener('resize', () => this.resize());
      this.createParticles();
      this.animate();
    }

    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    createParticles() {
      for (let i = 0; i < this.maxParticles; i++) {
        this.particles.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.2,
          color: Math.random() > 0.5 ? '#6C2BD9' : '#0D9488',
        });
      }
    }

    animate() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = p.opacity;
        this.ctx.fill();
      });

      this.ctx.globalAlpha = 1;
      requestAnimationFrame(() => this.animate());
    }
  }

  // Magnetic Button Effect
  function initMagneticButtons() {
    document.querySelectorAll('.header-btn, .role-btn, .nav-link').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(btn, {
          x: x * 0.3,
          y: y * 0.3,
          duration: 0.3,
          ease: 'power2.out',
        });
      });

      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: 'elastic.out(1, 0.5)',
        });
      });
    });
  }

  // Card Hover Effects
  function initCardEffects() {
    document.querySelectorAll('.glass-card, .stat-card').forEach((card) => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          y: -5,
          boxShadow: '0 20px 40px rgba(108, 43, 217, 0.2)',
          duration: 0.4,
          ease: 'power2.out',
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          y: 0,
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
          duration: 0.4,
          ease: 'power2.out',
        });
      });
    });
  }

  // Staggered Entrance Animation
  function animateEntrance() {
    const tl = gsap.timeline();

    // Sidebar animation
    tl.from('.sidebar', {
      x: -100,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
    });

    // Header animation
    tl.from(
      '.top-header',
      {
        y: -50,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
      },
      '-=0.4'
    );

    // Stats stagger
    tl.from(
      '.stat-card',
      {
        y: 30,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power3.out',
      },
      '-=0.3'
    );

    // Cards stagger
    tl.from(
      '.glass-card',
      {
        y: 30,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power3.out',
      },
      '-=0.3'
    );
  }

  // Section Transition Animation
  function animateSectionTransition(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    gsap.fromTo(
      section,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
      }
    );

    // Animate elements within section
    gsap.fromTo(
      section.querySelectorAll('.stat-card'),
      { opacity: 0, scale: 0.9 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        stagger: 0.05,
        ease: 'back.out(1.7)',
      }
    );
  }

  // Heatmap Cell Animation
  function animateHeatmapCells() {
    document.querySelectorAll('.heatmap-cell').forEach((cell, index) => {
      gsap.from(cell, {
        scale: 0,
        opacity: 0,
        duration: 0.4,
        delay: index * 0.02,
        ease: 'back.out(1.7)',
      });
    });
  }

  // Number Counter Animation
  function animateCounters() {
    document.querySelectorAll('.stat-value').forEach((counter) => {
      const text = counter.textContent;
      const hasNumber = /\d/.test(text);

      if (hasNumber) {
        const finalValue = text;
        gsap.from(counter, {
          textContent: 0,
          duration: 1.5,
          ease: 'power2.out',
          snap: { textContent: 1 },
          onUpdate: function () {
            if (finalValue.includes('%')) {
              counter.textContent = Math.round(this.targets()[0].textContent) + '%';
            } else if (finalValue.includes(',')) {
              counter.textContent = Math.round(this.targets()[0].textContent).toLocaleString();
            } else {
              counter.textContent = Math.round(this.targets()[0].textContent);
            }
          },
        });
      }
    });
  }

  // Progress Bar Animation
  function animateProgressBars() {
    document.querySelectorAll('.progress-fill').forEach((bar) => {
      const width = bar.style.width;
      gsap.fromTo(
        bar,
        { width: '0%' },
        {
          width: width,
          duration: 1.2,
          ease: 'power2.out',
        }
      );
    });
  }

  // Chat Panel Animation
  function animateChatPanel(open) {
    const panel = document.getElementById('chatPanel');
    if (!panel) return;

    if (open) {
      gsap.to(panel, {
        right: 0,
        duration: 0.5,
        ease: 'power3.out',
      });
    } else {
      gsap.to(panel, {
        right: -420,
        duration: 0.4,
        ease: 'power3.in',
      });
    }
  }

  // Notification Panel Animation
  function animateNotificationPanel(open) {
    const panel = document.getElementById('notifPanel');
    if (!panel) return;

    if (open) {
      gsap.fromTo(
        panel,
        { opacity: 0, x: 20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.3,
          ease: 'power2.out',
        }
      );
    } else {
      gsap.to(panel, {
        opacity: 0,
        x: 20,
        duration: 0.2,
        ease: 'power2.in',
      });
    }
  }

  // Toast Notification Animation
  function animateToast(toast) {
    gsap.fromTo(
      toast,
      { x: 100, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.4,
        ease: 'back.out(1.7)',
      }
    );

    gsap.to(toast, {
      x: 100,
      opacity: 0,
      duration: 0.3,
      delay: 4.5,
      ease: 'power2.in',
      onComplete: () => toast.remove(),
    });
  }

  // Modal Animation
  function animateModal(open) {
    const modal = document.getElementById('settingsModal');
    if (!modal) return;

    const content = modal.querySelector('.modal-content');

    if (open) {
      gsap.to(modal, { opacity: 1, duration: 0.3 });
      gsap.fromTo(
        content,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' }
      );
    } else {
      gsap.to(content, {
        scale: 0.9,
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
      });
      gsap.to(modal, {
        opacity: 0,
        duration: 0.2,
        delay: 0.1,
      });
    }
  }

  // Ticker Animation Enhancement
  function enhanceTicker() {
    const ticker = document.querySelector('.ticker-track');
    if (!ticker) return;

    gsap.to(ticker, {
      xPercent: -50,
      duration: 40,
      repeat: -1,
      ease: 'none',
    });
  }

  // Live Indicator Pulse
  function animateLiveIndicators() {
    document.querySelectorAll('.live-dot, .ticker-live').forEach((dot) => {
      gsap.to(dot, {
        scale: 1.5,
        opacity: 0.5,
        duration: 0.8,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
      });
    });
  }

  // Navigation Active State Animation
  function animateNavActive() {
    document.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', function () {
        document.querySelectorAll('.nav-link').forEach((l) => {
          gsap.to(l, { x: 0, duration: 0.3 });
        });

        if (this.classList.contains('active')) {
          gsap.fromTo(this, { x: -10 }, { x: 0, duration: 0.4, ease: 'power2.out' });
        }
      });
    });
  }

  // Role Switch Animation
  function animateRoleSwitch() {
    document.querySelectorAll('.role-btn').forEach((btn) => {
      btn.addEventListener('click', function () {
        gsap.fromTo(this, { scale: 0.9 }, { scale: 1, duration: 0.3, ease: 'back.out(1.7)' });
      });
    });
  }

  // Gate Bar Animation
  function animateGateBars() {
    document.querySelectorAll('.gate-bar').forEach((bar) => {
      const fill = bar.querySelector('.gate-fill');
      if (fill) {
        gsap.from(fill, {
          width: 0,
          duration: 0.8,
          ease: 'power2.out',
        });
      }
    });
  }

  // Ripple Effect for Buttons
  function createRippleEffect(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s ease-out;
      pointer-events: none;
    `;

    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  }

  // Add ripple animation CSS
  const rippleStyle = document.createElement('style');
  rippleStyle.textContent = `
    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(rippleStyle);

  // Initialize all animations
  function init() {
    // Start particle system
    const particleSystem = new ParticleSystem(document.body);

    // Initialize effects (commented out magnetic buttons to prevent interference)
    // initMagneticButtons();
    initCardEffects();
    animateEntrance();
    enhanceTicker();
    animateLiveIndicators();
    animateNavActive();
    animateRoleSwitch();

    // Add ripple effect to buttons (commented out to prevent interference)
    // document.querySelectorAll('button').forEach(btn => {
    //   btn.addEventListener('click', createRippleEffect);
    // });

    // Expose animation functions globally
    window.Animations = {
      sectionTransition: animateSectionTransition,
      heatmapCells: animateHeatmapCells,
      counters: animateCounters,
      progressBars: animateProgressBars,
      chatPanel: animateChatPanel,
      notificationPanel: animateNotificationPanel,
      toast: animateToast,
      modal: animateModal,
      gateBars: animateGateBars,
    };

    console.log('✨ Animations initialized');
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
