const PixiMenuBackground = {
  container: null,
  particles: [],
  stars: [],
  initialized: false,
  themeId: null,
  _tickerFn: null,

  init() {
    if (!PixiApp.app || !PixiApp.stage) return;
    this.destroy();

    this.container = new PIXI.Container();
    PixiApp.stage.addChildAt(this.container, 0);

    const theme = ThemeManager.getTheme(store.get('theme') || 'space');
    this.themeId = theme.id;
    this.colors = theme.colors;

    // Floating particles (theme-colored)
    this.particles = [];
    for (let i = 0; i < 50; i++) {
      const p = this._createParticle();
      this.particles.push(p);
      this.container.addChild(p.sprite);
    }

    // Twinkling stars
    this.stars = [];
    for (let i = 0; i < 30; i++) {
      const s = this._createStar();
      this.stars.push(s);
      this.container.addChild(s.sprite);
    }

    this._tickerFn = (delta) => this._update(delta);
    PixiApp.app.ticker.add(this._tickerFn);
    this.initialized = true;
  },

  _createParticle() {
    const sprite = new PIXI.Graphics();
    const size = 2 + Math.random() * 4;
    const isAccent = Math.random() > 0.5;
    const hex = isAccent ? this.colors.accent : '#ffffff';
    const color = parseInt(hex.replace('#', '0x'), 16);

    sprite.beginFill(color, 0.5);
    sprite.drawRect(-size / 2, -size / 2, size, size);
    sprite.endFill();

    return {
      sprite,
      x: Math.random() * 1280,
      y: Math.random() * 800,
      vx: (Math.random() - 0.5) * 15,
      vy: -8 - Math.random() * 25,
      baseAlpha: 0.2 + Math.random() * 0.5,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.5 + Math.random() * 1.5,
    };
  },

  _createStar() {
    const sprite = new PIXI.Graphics();
    const size = 1 + Math.random() * 2;

    sprite.beginFill(0xffffff, 0.8);
    sprite.drawRect(-size / 2, -size / 2, size, size);
    sprite.endFill();

    return {
      sprite,
      x: Math.random() * 1280,
      y: Math.random() * 800,
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: 1 + Math.random() * 2,
      baseAlpha: 0.3 + Math.random() * 0.5,
    };
  },

  _update(delta) {
    const dt = delta / 60;

    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.pulse += p.pulseSpeed * dt;

      p.sprite.x = p.x;
      p.sprite.y = p.y;
      p.sprite.alpha = p.baseAlpha * (0.6 + 0.4 * Math.sin(p.pulse));

      if (p.y < -10) { p.y = 810; p.x = Math.random() * 1280; }
      if (p.x < -10) p.x = 1290;
      if (p.x > 1290) p.x = -10;
    }

    for (const s of this.stars) {
      s.twinkle += s.twinkleSpeed * dt;
      s.sprite.alpha = s.baseAlpha * (0.5 + 0.5 * Math.sin(s.twinkle));
    }

    const currentTheme = store.get('theme') || 'space';
    if (this.themeId !== currentTheme) {
      this.destroy();
      this.init();
    }
  },

  destroy() {
    if (PixiApp.app && PixiApp.app.ticker && this._tickerFn) {
      PixiApp.app.ticker.remove(this._tickerFn);
      this._tickerFn = null;
    }
    if (this.container) {
      this.container.removeChildren();
      if (this.container.parent) {
        this.container.parent.removeChild(this.container);
      }
      this.container.destroy({ children: true });
      this.container = null;
    }
    this.particles = [];
    this.stars = [];
    this.initialized = false;
  },
};
