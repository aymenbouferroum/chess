class PixiDitheredRect extends PIXI.Container {
  constructor(config) {
    super();
    this.config = Object.assign({
      width: 100,
      height: 3,
      color: '#ffffff',
      alpha: 0.2,
    }, config);

    // Create canvas, texture, and sprite once
    this._canvas = document.createElement('canvas');
    this._canvas.width = 2;
    this._canvas.height = 2;

    this._texture = PIXI.Texture.from({ resource: this._canvas, scaleMode: 'nearest' });
    this._sprite = new PIXI.TilingSprite({ texture: this._texture, width: this.config.width, height: this.config.height });
    this.addChild(this._sprite);

    this._updatePattern();
  }

  setColor(color, alpha) {
    this.config.color = color;
    if (alpha !== undefined) this.config.alpha = alpha;
    this._updatePattern();
  }

  resize(w, h) {
    this.config.width = w;
    this.config.height = h;
    if (this._sprite) {
      this._sprite.width = w;
      this._sprite.height = h;
    }
  }

  _updatePattern() {
    const ctx = this._canvas.getContext('2d');
    ctx.clearRect(0, 0, 2, 2);
    ctx.fillStyle = this.config.color;
    ctx.globalAlpha = this.config.alpha;
    ctx.fillRect(0, 0, 1, 1);
    ctx.fillRect(1, 1, 1, 1);

    this._texture.source.update();
  }

  destroy(options) {
    if (this._texture) {
      this._texture.destroy(true);
      this._texture = null;
    }
    this._canvas = null;
    super.destroy(options);
  }
}
