const PixiMiniGameFX = {
  container: null,
  initialized: false,

  init() {
    if (!PixiApp.app || !PixiApp.stage) return;
    this.destroy();

    this.container = new PIXI.Container();
    PixiApp.stage.addChild(this.container);
    this.initialized = true;
  },

  spawnCombo(x, y, comboCount) {
    if (!this.container) return;
    const text = new PIXI.Text(comboCount + 'x COMBO!', {
      fontFamily: 'monospace',
      fontSize: 22,
      fontWeight: 'bold',
      fill: 0xffdd44,
      dropShadow: true,
      dropShadowColor: 0xffdd44,
      dropShadowBlur: 12,
      dropShadowDistance: 0,
    });
    text.anchor.set(0.5);
    text.x = x;
    text.y = y;
    this.container.addChild(text);

    gsap.to(text, {
      y: y - 60,
      alpha: 0,
      duration: 1.2,
      ease: 'power2.out',
      onComplete: () => {
        if (text.parent) text.parent.removeChild(text);
        text.destroy();
      },
    });
  },

  spawnSparks(x, y, colorHex, count) {
    if (!this.container) return;
    count = count || 8;
    const color = typeof colorHex === 'string' ? parseInt(colorHex.replace('#', '0x'), 16) : colorHex;

    for (let i = 0; i < count; i++) {
      const sprite = new PIXI.Graphics();
      const size = 2 + Math.random() * 3;
      sprite.beginFill(color, 0.9);
      sprite.drawRect(-size / 2, -size / 2, size, size);
      sprite.endFill();

      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 100;
      sprite.x = x;
      sprite.y = y;
      this.container.addChild(sprite);

      gsap.to(sprite, {
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0,
        duration: 0.4 + Math.random() * 0.3,
        ease: 'power2.out',
        onComplete: () => {
          if (sprite.parent) sprite.parent.removeChild(sprite);
          sprite.destroy();
        },
      });
    }
  },

  spawnBlockFlash(x, y, w, h) {
    if (!this.container) return;
    const flash = new PIXI.Graphics();
    flash.beginFill(0x44ff44, 0.25);
    flash.drawRect(x, y, w, h);
    flash.endFill();
    this.container.addChild(flash);

    gsap.to(flash, {
      alpha: 0,
      duration: 0.3,
      ease: 'power2.out',
      onComplete: () => {
        if (flash.parent) flash.parent.removeChild(flash);
        flash.destroy();
      },
    });
  },

  spawnHitFlash(x, y, w, h) {
    if (!this.container) return;
    const flash = new PIXI.Graphics();
    flash.beginFill(0xff4444, 0.25);
    flash.drawRect(x, y, w, h);
    flash.endFill();
    this.container.addChild(flash);

    gsap.to(flash, {
      alpha: 0,
      duration: 0.3,
      ease: 'power2.out',
      onComplete: () => {
        if (flash.parent) flash.parent.removeChild(flash);
        flash.destroy();
      },
    });
  },

  spawnFloatingText(x, y, textStr, colorHex, fontSize) {
    if (!this.container) return;
    fontSize = fontSize || 18;
    const color = typeof colorHex === 'string' ? parseInt(colorHex.replace('#', '0x'), 16) : (colorHex || 0xffffff);
    const text = new PIXI.Text(textStr, {
      fontFamily: 'monospace',
      fontSize: fontSize,
      fontWeight: 'bold',
      fill: color,
      dropShadow: true,
      dropShadowColor: color,
      dropShadowBlur: 8,
      dropShadowDistance: 0,
    });
    text.anchor.set(0.5);
    text.x = x;
    text.y = y;
    this.container.addChild(text);

    gsap.to(text, {
      y: y - 40,
      alpha: 0,
      duration: 1.0,
      ease: 'power2.out',
      onComplete: () => {
        if (text.parent) text.parent.removeChild(text);
        text.destroy();
      },
    });
  },

  shakeScreen(intensity) {
    if (!PixiApp.stage) return;
    intensity = intensity || 8;
    gsap.to(PixiApp.stage, {
      x: intensity,
      duration: 0.05,
      yoyo: true,
      repeat: 5,
      onComplete: () => { PixiApp.stage.x = 0; },
    });
  },

  destroy() {
    if (this.container) {
      this.container.removeChildren();
      if (this.container.parent) {
        this.container.parent.removeChild(this.container);
      }
      this.container.destroy({ children: true });
      this.container = null;
    }
    this.initialized = false;
  },
};
