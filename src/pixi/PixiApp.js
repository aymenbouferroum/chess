const PixiApp = {
  app: null,
  stage: null,
  initialized: false,

  init() {
    if (this.initialized) return;

    const canvas = document.getElementById('pixiCanvas');

    this.app = new PIXI.Application({
      view: canvas,
      width: 1280,
      height: 800,
      backgroundAlpha: 0,
      antialias: false,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    // Pixel-art crispness
    PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;

    this.stage = this.app.stage;
    this.initialized = true;
  },

  resize() {
    if (!this.app) return;
    this.app.renderer.resize(1280, 800);
  },

  clearStage() {
    if (this.stage) {
      this.stage.removeChildren();
    }
  },

  destroy() {
    if (this.app) {
      this.app.destroy(true, { children: true, texture: true, baseTexture: true });
      this.app = null;
      this.stage = null;
      this.initialized = false;
    }
  },
};
