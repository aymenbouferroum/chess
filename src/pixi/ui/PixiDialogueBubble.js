class PixiDialogueBubble extends PIXI.Container {
  constructor(config) {
    super();
    this.label = 'dialogueBubble';
    this.zIndex = 200;
    this._duration = config.duration || 5000;
    this._dismissed = false;
    this._build(config);
    this._animateIn();
  }

  _build(config) {
    const { name, text, colors, cols } = config;
    const isPortrait = Layout.isPortrait;
    const bubbleW = isPortrait ? 300 : 260;
    const padding = 12;
    const nameSize = 13;
    const textSize = 15;
    const maxTextW = bubbleW - padding * 2;

    const nameText = new PIXI.Text({
      text: name,
      style: {
        fontFamily: PixiTextStyles.FONT_BODY,
        fontSize: nameSize,
        fontWeight: 'bold',
        fill: PixiColorUtil.hexToNum(colors.primary),
      },
    });
    nameText.x = padding;
    nameText.y = padding;

    const bodyText = new PIXI.Text({
      text: text,
      style: {
        fontFamily: PixiTextStyles.FONT_BODY,
        fontSize: textSize,
        fill: 0xffffff,
        wordWrap: true,
        wordWrapWidth: maxTextW,
        lineHeight: textSize + 4,
      },
    });
    bodyText.x = padding;
    bodyText.y = padding + nameSize + 6;

    const maxBodyH = (textSize + 4) * 4;
    if (bodyText.height > maxBodyH) {
      bodyText.height = maxBodyH;
    }

    const bubbleH = padding + nameSize + 6 + Math.min(bodyText.height, maxBodyH) + padding;

    const bg = new PIXI.Graphics();
    const fillColor = PixiColorUtil.hexToNum(colors.secondary);
    const borderColor = PixiColorUtil.hexToNum(colors.primary);

    bg.roundRect(3, 3, bubbleW, bubbleH, 8).fill({ color: 0x000000, alpha: 0.35 });
    bg.roundRect(0, 0, bubbleW, bubbleH, 8).fill({ color: fillColor, alpha: 0.88 });
    bg.roundRect(0, 0, bubbleW, bubbleH, 8).stroke({ color: borderColor, alpha: 0.7, width: 2 });

    const tailSize = 8;
    if (!isPortrait) {
      const tailX = bubbleW;
      const tailY = bubbleH / 2;
      bg.moveTo(tailX, tailY - tailSize);
      bg.lineTo(tailX + tailSize, tailY);
      bg.lineTo(tailX, tailY + tailSize);
      bg.closePath();
      bg.fill({ color: fillColor, alpha: 0.88 });
    }

    this.addChild(bg);
    this.addChild(nameText);
    this.addChild(bodyText);

    if (isPortrait) {
      this.x = (Layout.W - bubbleW) / 2;
      this.y = 20;
    } else {
      this.x = 720;
      this.y = 340;
    }
  }

  _animateIn() {
    this.alpha = 0;
    const startX = this.x;
    this.x = startX + 20;
    gsap.to(this, { alpha: 1, x: startX, duration: 0.3, ease: 'back.out(1.5)' });

    this._dismissTimer = setTimeout(() => {
      this.dismiss();
    }, this._duration);
  }

  dismiss() {
    if (this._dismissed) return;
    this._dismissed = true;
    if (this._dismissTimer) {
      clearTimeout(this._dismissTimer);
      this._dismissTimer = null;
    }
    gsap.to(this, {
      alpha: 0,
      duration: 0.3,
      onComplete: () => {
        if (this.parent) this.parent.removeChild(this);
        this.destroy({ children: true });
      },
    });
  }
}
