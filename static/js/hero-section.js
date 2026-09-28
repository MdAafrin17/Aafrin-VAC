/**
 * CampusConnect — 3D College Construction HeroSection Component
 * 
 * Cinematic 3D Architectural Construction Reveal:
 * - Reveal Direction: BOTTOM → TOP exclusively
 * - Sequence:
 *     0.0s – 0.4s: Ground & Foundation appear (illuminated foundation baseline & perspective grid)
 *     0.4s – 1.0s: Lower portion & first floors construct upward
 *     1.0s – 1.6s: Middle floors & neoclassical arches assemble
 *     1.6s – 2.2s: Upper floors & balustrades construct
 *     2.2s – 2.7s: Roof & domes lock into place (clip-path reaching 0%)
 *     2.7s – 3.2s: Lights, window radiance, and holographic light sweep across building
 *     3.2s – 3.5s: "Connect. Discover. Participate." text, CTAs, and telemetry cards assemble
 * 
 * Features:
 * - Active construction laser beam riding the rising building edge
 * - Construction spark & dust particle emitter localized at the active elevation line
 * - Viewport detection via IntersectionObserver ({ threshold: 0.5 })
 * - Reusable GSAP timeline: reset to 0 on exit, restart from ground on return
 * - Fast-scroll cancellation protection
 * - Mobile optimization (< 768px)
 * - Accessibility: prefers-reduced-motion fallback
 * - Full component lifecycle cleanup
 */

class HeroSection {
  constructor(selector = '#heroSection') {
    this.container = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!this.container) return;

    // Cache DOM Elements
    this.bgCanvas = this.container.querySelector('#hero3DBgCanvas');
    this.cockpit = this.container.querySelector('#heroGlassCockpit');
    this.campusText = this.container.querySelector('#giantCampusText');
    this.connectText = this.container.querySelector('#giantConnectText');
    this.telemetryCards = this.container.querySelectorAll('.floating-telemetry-card');
    this.pCanvas = this.container.querySelector('#heroParticlesCanvas');

    // Construction Visual Stage Elements
    this.groundGrid = this.container.querySelector('#heroGroundGrid');
    this.groundFoundation = this.container.querySelector('#heroGroundFoundation');
    this.constructionBeam = this.container.querySelector('#heroConstructionBeam');
    this.lightSweep = this.container.querySelector('#heroCollegeLightSweep');

    // Atmospheric Glows
    this.glowElements = this.container.querySelectorAll('.hero-studio-spotlight, .hero-3d-bg-glow, .hero-arch-radiance, .hero-fountain-aura');
    this.volumetricRays = this.container.querySelector('.hero-volumetric-rays');

    // UI Content Elements
    this.badge = this.container.querySelector('#heroGlassCockpit .badge');
    this.headline = this.container.querySelector('.hero-brand-headline');
    this.subheading = this.container.querySelector('.hero-brand-subheading');
    this.supporting = this.container.querySelector('.hero-brand-supporting');
    this.searchBar = this.container.querySelector('.hero-cockpit-search');
    this.ctaButtons = this.container.querySelectorAll('.hero-cta-group .btn-product-cta');

    // Construction Progress State (100% = fully hidden at ground, 0% = fully constructed at roof)
    this.constructionState = { progress: 100 };
    this.activeBeamYRatio = 1.0;
    this.isConstructing = false;

    // Viewport & Lifecycle State
    this.isHeroVisible = false;
    this.isAnimationActive = false;
    this.timeline = null;
    this.observer = null;

    // Device & Accessibility Settings
    this.isMobile = window.innerWidth <= 768;
    this.prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Interactive Mouse & Ambient Breathing Loop State
    this.renderLoopId = null;
    this.isMouseActive = false;
    this.targetBgRotX = 0;
    this.targetBgRotY = 0;
    this.currentBgRotX = 0;
    this.currentBgRotY = 0;
    this.targetCockpitX = 0;
    this.targetCockpitY = 0;
    this.currentCockpitX = 0;
    this.currentCockpitY = 0;
    this.renderStartTime = performance.now();

    // Particle System State
    this.pCtx = null;
    this.pWidth = 0;
    this.pHeight = 0;
    this.particles = [];
    this.constructionSparks = [];
    this.particleAnimId = null;
    this.isParticlesRunning = false;

    // Bound event handlers
    this.handleMouseMove = this.onMouseMove.bind(this);
    this.handleMouseLeave = this.onMouseLeave.bind(this);
    this.handleResize = this.onResize.bind(this);
    this.handleNavTrigger = this.onNavTrigger.bind(this);

    this.init();
  }

  init() {
    this.initParticles();
    this.buildTimeline();
    this.initMouseListeners();
    this.initObserver();
    this.initNavTriggers();

    // Initial load check
    const rect = this.container.getBoundingClientRect();
    const isInitiallyVisible = (rect.top < window.innerHeight * 0.5) && (rect.bottom > window.innerHeight * 0.5);
    if (isInitiallyVisible || window.scrollY < 100) {
      this.isHeroVisible = true;
      this.play();
    } else {
      // Set to initial ground state
      this.reset();
    }
  }

  // =========================================================================
  // 1. REUSABLE 3D CONSTRUCTION TIMELINE (Built Once, Replayed via .restart())
  // =========================================================================
  buildTimeline() {
    if (typeof gsap === 'undefined') return;

    if (this.timeline) {
      this.timeline.kill();
    }

    // --- ACCESSIBILITY: Reduced Motion Fallback ---
    if (this.prefersReducedMotion) {
      this.timeline = gsap.timeline({
        paused: true,
        onStart: () => {
          this.isAnimationActive = true;
          this.stopMouseParallax();
        },
        onComplete: () => {
          this.onAnimationComplete();
        }
      });

      this.timeline
        .set([this.cockpit, this.telemetryCards, this.campusText, this.connectText], { clearProps: 'transform' })
        .fromTo(this.constructionState, { progress: 100 }, {
          progress: 0,
          duration: 1.2,
          ease: 'power2.out',
          onUpdate: () => { this.updateConstructionEdge(this.constructionState.progress); }
        }, 0)
        .fromTo([this.cockpit, this.telemetryCards], { opacity: 0 }, { opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power1.out' }, 0.8);

      return;
    }

    // --- CINEMATIC 3D CONSTRUCTION SEQUENCE (2.5s – 3.5s) ---
    const initialBgScale = this.isMobile ? 1.10 : 1.18;
    const finalBgScale = 1.07;
    const totalDuration = this.isMobile ? 2.8 : 3.4;

    this.timeline = gsap.timeline({
      paused: true,
      defaults: { ease: 'power2.inOut' },
      onStart: () => {
        this.isAnimationActive = true;
        this.isConstructing = true;
        this.stopMouseParallax();
      },
      onComplete: () => {
        this.onAnimationComplete();
      }
    });

    // -----------------------------------------------------------------------
    // STAGE 1: 0.0s – 0.4s | GROUND & FOUNDATION
    // -----------------------------------------------------------------------
    // Set building initial state: clipped 100% (hidden behind ground)
    this.timeline.set(this.constructionState, { progress: 100 }, 0);
    this.timeline.call(() => { this.updateConstructionEdge(100); }, null, 0);

    // Foundation baseline & perspective blueprint grid illuminate at the bottom
    if (this.groundFoundation) {
      this.timeline.fromTo(this.groundFoundation,
        { opacity: 0, scaleX: 0.7 },
        { opacity: 1, scaleX: 1, duration: 0.4, ease: 'power2.out' },
        0.0
      );
    }
    if (this.groundGrid) {
      this.timeline.fromTo(this.groundGrid,
        { opacity: 0 },
        { opacity: 0.85, duration: 0.5, ease: 'power2.out' },
        0.05
      );
    }
    if (this.constructionBeam) {
      this.timeline.fromTo(this.constructionBeam,
        { opacity: 0, top: '100%' },
        { opacity: 1, top: '100%', duration: 0.35, ease: 'power2.out' },
        0.05
      );
    }

    // -----------------------------------------------------------------------
    // STAGE 2: 0.0s – 2.7s | PROGRESSIVE BOTTOM-TO-TOP BUILDING ASSEMBLY
    // 0.0s – 0.4s: Ground / Foundation  (100% -> 84%)
    // 0.4s – 1.0s: Lower floors & base  (84%  -> 62%)
    // 1.0s – 1.6s: Middle floors        (62%  -> 38%)
    // 1.6s – 2.2s: Upper floors         (38%  -> 14%)
    // 2.2s – 2.7s: Roof & top structure (14%  -> 0%)
    // -----------------------------------------------------------------------
    if (this.bgCanvas) {
      // 3D scale and upward translation of building as it rises
      this.timeline.fromTo(this.bgCanvas,
        {
          opacity: 0.8,
          scale: initialBgScale,
          y: 30,
          filter: 'saturate(0.85) contrast(1.2) brightness(0.7) blur(3px)'
        },
        {
          opacity: 1,
          scale: finalBgScale,
          y: 0,
          filter: 'saturate(1.25) contrast(1.15) brightness(1.02) blur(0px)',
          duration: 2.7,
          ease: 'power2.out'
        },
        0.1
      );
    }

    // Progressive Bottom-to-Top Clip Path Reveal and Beam Tracking
    this.timeline.to(this.constructionState, {
      progress: 0,
      duration: 2.7,
      ease: 'power1.inOut',
      onUpdate: () => {
        this.updateConstructionEdge(this.constructionState.progress);
      }
    }, 0.0);

    // Subtle early environmental typography during construction
    if (this.campusText) {
      this.timeline.fromTo(this.campusText,
        { opacity: 0, y: -40, scale: 0.94 },
        { opacity: 0.12, y: 0, scale: 1, duration: 1.4, ease: 'power2.out' },
        0.8
      );
    }
    if (this.connectText) {
      this.timeline.fromTo(this.connectText,
        { opacity: 0, y: 40, scale: 0.94 },
        { opacity: 1, y: 0, scale: 1, duration: 1.4, ease: 'power2.out' },
        1.2
      );
    }

    // Central Frosted Cockpit begins ascending into foreground
    if (this.cockpit) {
      this.timeline.fromTo(this.cockpit,
        { opacity: 0, scale: 0.92, y: 45 },
        { opacity: 1, scale: 1, y: 0, duration: 1.4, ease: 'power3.out' },
        1.5
      );
    }

    // -----------------------------------------------------------------------
    // STAGE 3: 2.7s – 3.2s | ROOF COMPLETE, LIGHT SWEEP & WINDOW ILLUMINATION
    // -----------------------------------------------------------------------
    // When roof completes, beam flashes and dissolves
    if (this.constructionBeam) {
      this.timeline.to(this.constructionBeam, {
        opacity: 0,
        duration: 0.35,
        ease: 'power2.in'
      }, 2.7);
    }
    if (this.groundFoundation) {
      this.timeline.to(this.groundFoundation, {
        opacity: 0.3,
        duration: 0.5,
        ease: 'power2.out'
      }, 2.7);
    }
    if (this.groundGrid) {
      this.timeline.to(this.groundGrid, {
        opacity: 0.2,
        duration: 0.6,
        ease: 'power2.out'
      }, 2.7);
    }

    // Full atmospheric lighting & fountain water aura blossom
    if (this.glowElements.length > 0) {
      this.timeline.fromTo(this.glowElements,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.7, stagger: 0.06, ease: 'power2.out' },
        2.7
      );
    }
    if (this.volumetricRays) {
      this.timeline.fromTo(this.volumetricRays,
        { opacity: 0, rotation: -22 },
        { opacity: 1, rotation: -12, duration: 0.8, ease: 'power2.out' },
        2.7
      );
    }

    // Holographic light sweep washing across the completed college building
    if (this.lightSweep) {
      this.timeline.fromTo(this.lightSweep,
        { xPercent: -150, opacity: 0.85 },
        { xPercent: 150, opacity: 0, duration: 0.65, ease: 'power2.out' },
        2.7
      );
    }

    // -----------------------------------------------------------------------
    // STAGE 4: 2.8s – 3.5s | HERO TEXT, CTAs & FLOATING CARDS ASSEMBLY
    // -----------------------------------------------------------------------
    // Badge & Heading "Connect. Discover. Participate."
    if (this.badge && this.headline) {
      this.timeline.fromTo([this.badge, this.headline],
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.55, stagger: 0.08, ease: 'power2.out' },
        2.8
      );
    } else if (this.headline) {
      this.timeline.fromTo(this.headline,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' },
        2.8
      );
    }

    // Subtitle & Supporting Copy
    const copyElements = [this.subheading, this.supporting].filter(Boolean);
    if (copyElements.length > 0) {
      this.timeline.fromTo(copyElements,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: 'power2.out' },
        3.0
      );
    }

    // Search Cockpit & CTA Buttons ("EXPLORE EVENTS", "POST AN EVENT")
    if (this.searchBar) {
      this.timeline.fromTo(this.searchBar,
        { opacity: 0, scale: 0.95, y: 14 },
        { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'power2.out' },
        3.1
      );
    }
    if (this.ctaButtons.length > 0) {
      this.timeline.fromTo(this.ctaButtons,
        { opacity: 0, y: 16, scale: 0.93 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.5)' },
        3.15
      );
    }

    // 4 Symmetrical Floating Telemetry Glass Cards pop out with 3D bounce
    if (this.telemetryCards.length > 0) {
      this.timeline.fromTo(this.telemetryCards,
        { opacity: 0, scale: 0.45, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'back.out(1.8)' },
        3.2
      );
    }

    // Formal stabilization point
    this.timeline.call(() => {
      this.isConstructing = false;
    }, null, 3.4);
  }

  // Update progressive vertical clip-path and construction beam elevation
  updateConstructionEdge(progressPercent) {
    const p = Math.max(0, Math.min(100, progressPercent));
    this.activeBeamYRatio = p / 100;

    // Reveal from BOTTOM to TOP exclusively: clip-path inset(p% 0 0 0)
    if (this.bgCanvas) {
      this.bgCanvas.style.clipPath = `inset(${p.toFixed(2)}% 0 0 0)`;
    }

    // Position construction laser beam at the active reveal horizon
    if (this.constructionBeam) {
      this.constructionBeam.style.top = `${p.toFixed(2)}%`;
      if (p < 0.5) {
        this.constructionBeam.style.opacity = '0';
      } else {
        this.constructionBeam.style.opacity = '1';
      }
    }
  }

  // =========================================================================
  // 2. PLAY, RESET & COMPLETION LIFECYCLE
  // =========================================================================
  play() {
    this.burstParticles();
    this.startParticles();

    if (!this.timeline) {
      this.buildTimeline();
    }

    if (this.timeline) {
      // Always start from progress 0 from the ground
      this.timeline.restart();
    }
  }

  reset() {
    this.stopMouseParallax();
    this.stopParticles();
    this.isConstructing = false;

    if (this.timeline) {
      // Pause at 0.0s (ground state)
      this.timeline.pause(0);
    }

    this.constructionState.progress = 100;
    this.updateConstructionEdge(100);

    if (this.groundFoundation) this.groundFoundation.style.opacity = '0';
    if (this.groundGrid) this.groundGrid.style.opacity = '0';
    if (this.constructionBeam) this.constructionBeam.style.opacity = '0';
    if (this.lightSweep) this.lightSweep.style.opacity = '0';
  }

  onAnimationComplete() {
    this.isAnimationActive = false;
    this.isConstructing = false;
    // Transition cleanly to interactive mouse parallax and gentle breathing
    if (this.isHeroVisible) {
      this.startMouseParallax();
    }
  }

  // =========================================================================
  // 3. VIEWPORT DETECTION (IntersectionObserver with threshold: 0.5)
  // =========================================================================
  initObserver() {
    if (!('IntersectionObserver' in window)) return;

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const isVisibleEnough = entry.isIntersecting && entry.intersectionRatio >= 0.5;

        if (isVisibleEnough) {
          // Hero visible >= 50%: Reset -> Play construction animation from beginning
          if (!this.isHeroVisible) {
            this.isHeroVisible = true;
            this.reset();
            this.play();
          }
        } else {
          // Hero visibility < 50%: Prepare animation for next replay
          if (this.isHeroVisible) {
            this.isHeroVisible = false;
            this.reset();
          }
        }
      });
    }, {
      root: null,
      threshold: 0.5
    });

    this.observer.observe(this.container);
  }

  // Fast scroll support via top nav / logo / dock click
  initNavTriggers() {
    const navTriggers = document.querySelectorAll('a[href="#heroSection"], a[href="#"], .dock-pill[data-section="heroSection"], .navbar-brand');
    navTriggers.forEach(el => {
      el.addEventListener('click', this.handleNavTrigger);
    });
  }

  onNavTrigger() {
    if (window.scrollY > 200) {
      this.isHeroVisible = false;
      this.reset();
    }
  }

  // =========================================================================
  // 4. CONSTRUCTION PARTICLES & SPARKS ENGINE
  // =========================================================================
  initParticles() {
    if (!this.pCanvas || this.prefersReducedMotion) return;

    this.pCtx = this.pCanvas.getContext('2d');
    this.pWidth = this.pCanvas.width = this.pCanvas.offsetWidth || window.innerWidth;
    this.pHeight = this.pCanvas.height = this.pCanvas.offsetHeight || 650;

    window.addEventListener('resize', this.handleResize, { passive: true });

    const particleColors = [
      'rgba(56, 189, 248, 0.8)',   // Cyan
      'rgba(0, 229, 255, 0.9)',   // Electric Neon
      'rgba(192, 132, 252, 0.65)', // Purple
      'rgba(251, 191, 36, 0.85)',  // Warm Gold
      'rgba(255, 255, 255, 0.95)'  // White Welding Spark
    ];

    const count = this.isMobile ? 18 : 36;
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.pWidth,
        y: Math.random() * this.pHeight,
        radius: Math.random() * 2.0 + 0.8,
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
        vx: (Math.random() - 0.5) * 0.45,
        vy: -(Math.random() * 0.55 + 0.25),
        alpha: Math.random() * 0.8 + 0.2,
        pulse: Math.random() * Math.PI
      });
    }

    // Construction Sparks array
    this.constructionSparks = [];
  }

  burstParticles() {
    if (!this.pWidth || !this.pHeight || this.prefersReducedMotion) return;
    this.particles.forEach(p => {
      p.x = Math.random() * this.pWidth;
      p.y = this.pHeight * (0.85 + Math.random() * 0.15); // seed right at ground
      p.vy = -(Math.random() * 0.85 + 0.4);
      p.alpha = Math.random() * 0.9 + 0.3;
    });
  }

  spawnConstructionSpark() {
    if (!this.isConstructing || !this.pWidth || !this.pHeight) return;
    // Emit right along the active construction beam elevation
    const currentBeamY = this.pHeight * this.activeBeamYRatio;
    const sparkColors = ['#00e5ff', '#38bdf8', '#ffffff', '#fbbf24'];

    for (let i = 0; i < 3; i++) {
      this.constructionSparks.push({
        x: Math.random() * this.pWidth,
        y: currentBeamY + (Math.random() - 0.5) * 8,
        vx: (Math.random() - 0.5) * 1.8,
        vy: -(Math.random() * 1.5 + 0.3),
        size: Math.random() * 2.5 + 1.0,
        color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
        life: 1.0,
        decay: Math.random() * 0.04 + 0.02
      });
    }
  }

  startParticles() {
    if (!this.pCanvas || !this.pCtx || this.isParticlesRunning || this.prefersReducedMotion) return;
    this.isParticlesRunning = true;

    const render = () => {
      if (!this.isParticlesRunning) return;
      this.pCtx.clearRect(0, 0, this.pWidth, this.pHeight);

      // 1. Ambient Stardust
      this.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.03;
        const currentAlpha = p.alpha * (0.65 + Math.sin(p.pulse) * 0.35);

        if (p.y < -10) { p.y = this.pHeight + 10; p.x = Math.random() * this.pWidth; }
        if (p.x < -10) p.x = this.pWidth + 10;
        if (p.x > this.pWidth + 10) p.x = -10;

        this.pCtx.beginPath();
        this.pCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.pCtx.fillStyle = p.color;
        this.pCtx.globalAlpha = Math.max(0, Math.min(1, currentAlpha));
        this.pCtx.shadowBlur = 8;
        this.pCtx.shadowColor = p.color;
        this.pCtx.fill();
      });

      // 2. Active Construction Laser Sparks
      if (this.isConstructing) {
        this.spawnConstructionSpark();

        for (let i = this.constructionSparks.length - 1; i >= 0; i--) {
          const s = this.constructionSparks[i];
          s.x += s.vx;
          s.y += s.vy;
          s.life -= s.decay;

          if (s.life <= 0) {
            this.constructionSparks.splice(i, 1);
            continue;
          }

          this.pCtx.beginPath();
          this.pCtx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
          this.pCtx.fillStyle = s.color;
          this.pCtx.globalAlpha = s.life;
          this.pCtx.shadowBlur = 12;
          this.pCtx.shadowColor = s.color;
          this.pCtx.fill();
        }
      }

      this.pCtx.globalAlpha = 1;
      this.pCtx.shadowBlur = 0;
      this.particleAnimId = requestAnimationFrame(render);
    };

    this.particleAnimId = requestAnimationFrame(render);
  }

  stopParticles() {
    this.isParticlesRunning = false;
    if (this.particleAnimId) {
      cancelAnimationFrame(this.particleAnimId);
      this.particleAnimId = null;
    }
    this.constructionSparks = [];
  }

  // =========================================================================
  // 5. INTERACTIVE MOUSE PARALLAX & AMBIENT BREATHING
  // =========================================================================
  initMouseListeners() {
    if (this.prefersReducedMotion) return;
    this.container.addEventListener('mousemove', this.handleMouseMove, { passive: true });
    this.container.addEventListener('mouseleave', this.handleMouseLeave, { passive: true });
  }

  onMouseMove(e) {
    if (this.isAnimationActive || !this.isHeroVisible) return;

    const rect = this.container.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    const factor = this.isMobile ? 0.35 : 1.0;
    this.targetBgRotX = -y * 8 * factor;
    this.targetBgRotY = x * 10 * factor;
    this.targetCockpitX = -y * 10 * factor;
    this.targetCockpitY = x * 12 * factor;

    this.telemetryCards.forEach(card => {
      const depth = parseFloat(card.getAttribute('data-depth')) || 1.8;
      const px = x * depth * 26 * factor;
      const py = y * depth * 22 * factor;
      card.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, ${depth * 28}px)`;
    });

    if (this.campusText) {
      this.campusText.style.transform = `translate3d(${(-x * 22 * factor).toFixed(1)}px, ${(-y * 14 * factor).toFixed(1)}px, 0)`;
    }
    if (this.connectText) {
      this.connectText.style.transform = `translate3d(${(-x * 30 * factor).toFixed(1)}px, ${(-y * 20 * factor).toFixed(1)}px, 0)`;
    }
  }

  onMouseLeave() {
    this.targetBgRotX = 0;
    this.targetBgRotY = 0;
    this.targetCockpitX = 0;
    this.targetCockpitY = 0;
    this.telemetryCards.forEach(c => c.style.transform = '');
    if (this.campusText) this.campusText.style.transform = '';
    if (this.connectText) this.connectText.style.transform = '';
  }

  startMouseParallax() {
    if (this.isMouseActive || this.isAnimationActive || !this.isHeroVisible || this.prefersReducedMotion) return;
    this.isMouseActive = true;
    this.renderStartTime = performance.now();

    const render = (now) => {
      if (!this.isMouseActive || this.isAnimationActive) return;

      const time = ((now || performance.now()) - this.renderStartTime) * 0.001;
      const idleRotX = Math.sin(time * 0.75) * 0.75;
      const idleRotY = Math.cos(time * 0.55) * 0.95;
      const idleCockpitZ = Math.sin(time * 1.1) * 3.2;

      this.currentBgRotX += (this.targetBgRotX + idleRotX - this.currentBgRotX) * 0.08;
      this.currentBgRotY += (this.targetBgRotY + idleRotY - this.currentBgRotY) * 0.08;
      this.currentCockpitX += (this.targetCockpitX + idleRotX * 0.6 - this.currentCockpitX) * 0.1;
      this.currentCockpitY += (this.targetCockpitY + idleRotY * 0.6 - this.currentCockpitY) * 0.1;

      if (this.bgCanvas) {
        this.bgCanvas.style.transform = `perspective(1200px) rotateX(${this.currentBgRotX.toFixed(2)}deg) rotateY(${this.currentBgRotY.toFixed(2)}deg) scale(1.07)`;
      }
      if (this.cockpit) {
        this.cockpit.style.transform = `perspective(1000px) rotateX(${this.currentCockpitX.toFixed(2)}deg) rotateY(${this.currentCockpitY.toFixed(2)}deg) translateZ(${(40 + idleCockpitZ).toFixed(1)}px)`;
      }

      this.renderLoopId = requestAnimationFrame(render);
    };

    this.renderLoopId = requestAnimationFrame(render);
  }

  stopMouseParallax() {
    this.isMouseActive = false;
    if (this.renderLoopId) {
      cancelAnimationFrame(this.renderLoopId);
      this.renderLoopId = null;
    }
    this.targetBgRotX = 0;
    this.targetBgRotY = 0;
    this.currentBgRotX = 0;
    this.currentBgRotY = 0;
    this.targetCockpitX = 0;
    this.targetCockpitY = 0;
    this.currentCockpitX = 0;
    this.currentCockpitY = 0;
  }

  onResize() {
    this.isMobile = window.innerWidth <= 768;
    if (this.pCanvas) {
      this.pWidth = this.pCanvas.width = this.pCanvas.offsetWidth || window.innerWidth;
      this.pHeight = this.pCanvas.height = this.pCanvas.offsetHeight || 650;
    }
  }

  // =========================================================================
  // 6. COMPONENT CLEANUP
  // =========================================================================
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    this.stopParticles();
    this.stopMouseParallax();

    if (this.timeline) {
      this.timeline.kill();
      this.timeline = null;
    }

    if (this.container) {
      this.container.removeEventListener('mousemove', this.handleMouseMove);
      this.container.removeEventListener('mouseleave', this.handleMouseLeave);
    }

    window.removeEventListener('resize', this.handleResize);

    const navTriggers = document.querySelectorAll('a[href="#heroSection"], a[href="#"], .dock-pill[data-section="heroSection"], .navbar-brand');
    navTriggers.forEach(el => {
      el.removeEventListener('click', this.handleNavTrigger);
    });
  }
}

// Global exposure for template initialization
if (typeof window !== 'undefined') {
  window.HeroSection = HeroSection;
}
