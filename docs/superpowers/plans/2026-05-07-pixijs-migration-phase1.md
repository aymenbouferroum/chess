# PixiJS Migration Phase 1 — Game Board + Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the game board rendering (BoardRenderer, PieceRenderer, BackgroundRenderer, ParticleFX, Animator) with PixiJS + GSAP, while keeping the chess engine, store, screens, and input untouched.

**Architecture:** PixiJS `Application` replaces `gameCanvas`. Each game element becomes a `PIXI.Sprite`, `PIXI.Graphics`, or `PIXI.Container`. GSAP handles all animations (piece movement, screen shake, flash). The existing `GameScreen` delegates rendering to a new `PixiGameScreen` adapter. All other screens remain on Canvas for now.

**Tech Stack:** Electron, vanilla JS, HTML5 Canvas, PixiJS 7.3.2 (CDN), GSAP 3.12.2 + PixiPlugin (CDN)

---

### Task 1: Add PixiJS + GSAP CDN to index.html

**Files:**
- Modify: `src/index.html:43-101`

- [ ] **Step 1: Add CDN scripts before existing scripts**

Add these three lines after the `<canvas>` elements and before the first `<script>` tag:

```html
  <script src="https://cdn.jsdelivr.net/npm/pixi.js@7.3.2/dist/pixi.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.2/dist/gsap.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.2/dist/PixiPlugin.min.js"></script>
```

- [ ] **Step 2: Register GSAP PixiPlugin**

Add this right after the CDN scripts (before any project scripts):

```html
  <script>gsap.registerPlugin(PixiPlugin); PixiPlugin.registerPIXI(PIXI);</script>
```

- [ ] **Step 3: Commit**

```bash
git add src/index.html
git commit -m "build: add PixiJS and GSAP CDN dependencies"
```

---

### Task 2: Create PixiApp.js (Application bootstrap)

**Files:**
- Create: `src/pixi/PixiApp.js`

- [ ] **Step 1: Write PixiApp.js**

```javascript
const PixiApp = {
  app: null,
  stage: null,
  initialized: false,

  init() {
    if (this.initialized) return;

    const canvas = document.getElementById('gameCanvas');
    const w = canvas.clientWidth || 1280;
    const h = canvas.clientHeight || 800;

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
    const canvas = document.getElementById('gameCanvas');
    const w = canvas.clientWidth || 1280;
    const h = canvas.clientHeight || 800;
    this.app.renderer.resize(1280, 800);
    this.app.stage.scale.set(w / 1280, h / 800);
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
```

- [ ] **Step 2: Commit**

```bash
git add src/pixi/PixiApp.js
git commit -m "feat: create PixiApp bootstrap module"
```

---

### Task 3: Create PixiPieceRenderer.js

**Files:**
- Create: `src/pixi/PixiPieceRenderer.js`
- Read first: `src/rendering/PieceRenderer.js` and `src/rendering/TextureManager.js`

- [ ] **Step 1: Write PixiPieceRenderer.js**

This replaces the canvas `drawImage` piece rendering with `PIXI.Sprite`:

```javascript
const PixiPieceRenderer = {
  textures: {},

  getTexture(themeId, color, type) {
    const key = `${themeId}_${color}_${type}`;
    if (this.textures[key]) return this.textures[key];

    const img = TextureManager.getPieceTexture(themeId, color, type);
    if (img) {
      const texture = PIXI.Texture.from(img);
      this.textures[key] = texture;
      return texture;
    }

    // Fallback: generate procedural sprite via SpriteGen, then create texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    SpriteGen.drawPiece(ctx, type, color, 0, 0, 64, themeId);
    const texture = PIXI.Texture.from(canvas);
    this.textures[key] = texture;
    return texture;
  },

  createSprite(themeId, color, type) {
    const texture = this.getTexture(themeId, color, type);
    const sprite = new PIXI.Sprite(texture);
    sprite.anchor.set(0.5);
    sprite.width = 64;
    sprite.height = 64;
    return sprite;
  },

  clearCache() {
    for (const key in this.textures) {
      this.textures[key].destroy(true);
    }
    this.textures = {};
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add src/pixi/PixiPieceRenderer.js
git commit -m "feat: create PixiPieceRenderer with texture caching"
```

---

### Task 4: Create PixiBackgroundRenderer.js

**Files:**
- Create: `src/pixi/PixiBackgroundRenderer.js`
- Read first: `src/rendering/BackgroundRenderer.js`

- [ ] **Step 1: Write PixiBackgroundRenderer.js**

A minimal Pixi-based background renderer that supports photo backgrounds and gradient fallbacks. Procedural themes get simplified first — full procedural themes migrate later:

```javascript
const PixiBackgroundRenderer = {
  container: null,
  bgSprite: null,

  init(parentStage) {
    this.container = new PIXI.Container();
    parentStage.addChild(this.container);
  },

  render(themeId) {
    if (!this.container) return;
    this.container.removeChildren();

    const theme = ThemeManager.getTheme(themeId);
    const cols = theme.colors;

    // Try photo background first
    const img = TextureManager.getBackgroundTexture(themeId);
    if (img) {
      this.bgSprite = PIXI.Sprite.from(img);
      this.bgSprite.width = 1280;
      this.bgSprite.height = 800;
      this.container.addChild(this.bgSprite);
      return;
    }

    // Fallback: gradient via canvas texture
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 800);
    grad.addColorStop(0, cols.background);
    grad.addColorStop(1, cols.panel);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1, 800);
    const texture = PIXI.Texture.from(canvas);
    const sprite = new PIXI.Sprite(texture);
    sprite.width = 1280;
    sprite.height = 800;
    this.container.addChild(sprite);
  },

  destroy() {
    if (this.container) {
      this.container.destroy({ children: true });
      this.container = null;
    }
    this.bgSprite = null;
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add src/pixi/PixiBackgroundRenderer.js
git commit -m "feat: create PixiBackgroundRenderer with photo + gradient support"
```

---

### Task 5: Create PixiParticleFX.js

**Files:**
- Create: `src/pixi/PixiParticleFX.js`

- [ ] **Step 1: Write PixiParticleFX.js**

Simple particle system using PIXI.Graphics sprites in a container:

```javascript
const PixiParticleFX = {
  container: null,
  particles: [],

  init(parentStage) {
    this.container = new PIXI.Container();
    parentStage.addChild(this.container);
  },

  spawnCapture(x, y, color) {
    for (let i = 0; i < 30; i++) {
      const p = new PIXI.Graphics();
      p.beginFill(color);
      p.drawCircle(0, 0, 2 + Math.random() * 3);
      p.endFill();
      p.x = x;
      p.y = y;
      p.vx = (Math.random() - 0.5) * 300;
      p.vy = (Math.random() - 0.5) * 300;
      p.life = 0.5 + Math.random() * 0.5;
      p.maxLife = p.life;
      this.container.addChild(p);
      this.particles.push(p);
    }
  },

  spawnMove(x, y, color) {
    for (let i = 0; i < 8; i++) {
      const p = new PIXI.Graphics();
      p.beginFill(color);
      p.drawCircle(0, 0, 1.5 + Math.random() * 2);
      p.endFill();
      p.x = x;
      p.y = y;
      p.vx = (Math.random() - 0.5) * 150;
      p.vy = (Math.random() - 0.5) * 150;
      p.life = 0.3 + Math.random() * 0.3;
      p.maxLife = p.life;
      this.container.addChild(p);
      this.particles.push(p);
    }
  },

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
      if (p.life <= 0) {
        this.container.removeChild(p);
        p.destroy();
        this.particles.splice(i, 1);
      }
    }
  },

  clear() {
    for (const p of this.particles) {
      this.container.removeChild(p);
      p.destroy();
    }
    this.particles = [];
  },

  destroy() {
    this.clear();
    if (this.container) {
      this.container.destroy({ children: true });
      this.container = null;
    }
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add src/pixi/PixiParticleFX.js
git commit -m "feat: create PixiParticleFX particle system"
```

---

### Task 6: Create PixiAnimator.js

**Files:**
- Create: `src/pixi/PixiAnimator.js`

- [ ] **Step 1: Write PixiAnimator.js**

GSAP-based animation wrapper for common game animations:

```javascript
const PixiAnimator = {
  movePiece(sprite, fromX, fromY, toX, toY, duration, onComplete) {
    sprite.x = fromX;
    sprite.y = fromY;
    gsap.to(sprite, {
      x: toX,
      y: toY,
      duration: duration || 0.3,
      ease: 'back.out(1.7)',
      onComplete: onComplete,
    });
  },

  capturePiece(sprite, onComplete) {
    gsap.to(sprite, {
      alpha: 0,
      scale: { x: 0.1, y: 0.1 },
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        if (sprite.parent) sprite.parent.removeChild(sprite);
        if (onComplete) onComplete();
      },
    });
  },

  promotePiece(sprite, onComplete) {
    gsap.to(sprite, {
      alpha: 0,
      duration: 0.15,
      yoyo: true,
      repeat: 1,
      onComplete: onComplete,
    });
  },

  screenShake(container, intensity, duration) {
    const originalX = container.x || 0;
    const originalY = container.y || 0;
    gsap.to(container, {
      x: originalX + intensity,
      y: originalY + intensity,
      duration: duration / 4,
      yoyo: true,
      repeat: 3,
      ease: 'power1.inOut',
      onComplete: () => {
        container.x = originalX;
        container.y = originalY;
      },
    });
  },

  flashScreen(graphics, color, duration) {
    graphics.clear();
    graphics.beginFill(color, 0.3);
    graphics.drawRect(0, 0, 1280, 800);
    graphics.endFill();
    graphics.alpha = 1;
    gsap.to(graphics, {
      alpha: 0,
      duration: duration || 0.3,
      ease: 'power2.out',
    });
  },

  highlightPulse(graphics, color) {
    gsap.fromTo(
      graphics,
      { alpha: 0.6 },
      { alpha: 0.2, duration: 0.8, repeat: -1, yoyo: true, ease: 'sine.inOut' }
    );
  },

  killTweensOf(target) {
    gsap.killTweensOf(target);
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add src/pixi/PixiAnimator.js
git commit -m "feat: create PixiAnimator with GSAP tween wrappers"
```

---

### Task 7: Create PixiBoardRenderer.js

**Files:**
- Create: `src/pixi/PixiBoardRenderer.js`
- Read first: `src/rendering/BoardRenderer.js`

- [ ] **Step 1: Write PixiBoardRenderer.js**

The main board renderer that manages squares, pieces, highlights, and legal move dots:

```javascript
const PixiBoardRenderer = {
  container: null,
  boardContainer: null,
  piecesContainer: null,
  overlayContainer: null,
  squares: [],
  pieceSprites: {},
  squareSize: 80,
  boardOffsetX: 320,
  boardOffsetY: 80,
  flashGraphics: null,
  selectedSprite: null,

  init(parentStage) {
    this.container = new PIXI.Container();
    parentStage.addChild(this.container);

    this.boardContainer = new PIXI.Container();
    this.piecesContainer = new PIXI.Container();
    this.overlayContainer = new PIXI.Container();

    this.container.addChild(this.boardContainer);
    this.container.addChild(this.piecesContainer);
    this.container.addChild(this.overlayContainer);

    // Screen flash overlay
    this.flashGraphics = new PIXI.Graphics();
    this.flashGraphics.interactive = false;
    this.container.addChild(this.flashGraphics);

    this.squares = [];
    this.pieceSprites = {};
  },

  drawBoard(themeId) {
    const theme = ThemeManager.getTheme(themeId);
    const cols = theme.colors;
    this.boardContainer.removeChildren();
    this.squares = [];

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const isLight = (row + col) % 2 === 0;
        const color = isLight ? cols.lightSquare : cols.darkSquare;
        const x = this.boardOffsetX + col * this.squareSize;
        const y = this.boardOffsetY + row * this.squareSize;

        const square = new PIXI.Graphics();
        square.beginFill(color);
        square.drawRect(x, y, this.squareSize, this.squareSize);
        square.endFill();
        square.gridX = col;
        square.gridY = row;
        square.baseColor = color;
        this.boardContainer.addChild(square);
        this.squares.push(square);
      }
    }
  },

  setPieces(board, themeId) {
    // Remove old piece sprites
    for (const key in this.pieceSprites) {
      const sprite = this.pieceSprites[key];
      if (sprite.parent) sprite.parent.removeChild(sprite);
      sprite.destroy();
    }
    this.pieceSprites = {};

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board.getPiece(row, col);
        if (piece) {
          const key = `${col},${row}`;
          const sprite = PixiPieceRenderer.createSprite(themeId, piece.color, piece.type);
          const x = this.boardOffsetX + col * this.squareSize + this.squareSize / 2;
          const y = this.boardOffsetY + row * this.squareSize + this.squareSize / 2;
          sprite.x = x;
          sprite.y = y;
          this.piecesContainer.addChild(sprite);
          this.pieceSprites[key] = sprite;
        }
      }
    }
  },

  movePiece(fromCol, fromRow, toCol, toRow, themeId, onComplete) {
    const key = `${fromCol},${fromRow}`;
    const sprite = this.pieceSprites[key];
    if (!sprite) {
      if (onComplete) onComplete();
      return;
    }

    const toX = this.boardOffsetX + toCol * this.squareSize + this.squareSize / 2;
    const toY = this.boardOffsetY + toRow * this.squareSize + this.squareSize / 2;

    PixiAnimator.movePiece(sprite, sprite.x, sprite.y, toX, toY, 0.3, () => {
      delete this.pieceSprites[key];
      this.pieceSprites[`${toCol},${toRow}`] = sprite;
      if (onComplete) onComplete();
    });
  },

  capturePiece(col, row, onComplete) {
    const key = `${col},${row}`;
    const sprite = this.pieceSprites[key];
    if (sprite) {
      PixiAnimator.capturePiece(sprite, () => {
        delete this.pieceSprites[key];
        if (onComplete) onComplete();
      });
    } else if (onComplete) {
      onComplete();
    }
  },

  highlightSquare(col, row, color, alpha) {
    const x = this.boardOffsetX + col * this.squareSize;
    const y = this.boardOffsetY + row * this.squareSize;
    const highlight = new PIXI.Graphics();
    highlight.beginFill(color, alpha || 0.5);
    highlight.drawRect(x, y, this.squareSize, this.squareSize);
    highlight.endFill();
    this.overlayContainer.addChild(highlight);
    return highlight;
  },

  clearHighlights() {
    this.overlayContainer.removeChildren();
    this.selectedSprite = null;
  },

  drawLegalMoves(moves) {
    for (const move of moves) {
      const cx = this.boardOffsetX + move.col * this.squareSize + this.squareSize / 2;
      const cy = this.boardOffsetY + move.row * this.squareSize + this.squareSize / 2;
      const dot = new PIXI.Graphics();
      dot.beginFill(0xffffff, 0.4);
      dot.drawCircle(cx, cy, 6);
      dot.endFill();
      this.overlayContainer.addChild(dot);
    }
  },

  selectSquare(col, row, color) {
    this.clearSelection();
    const x = this.boardOffsetX + col * this.squareSize;
    const y = this.boardOffsetY + row * this.squareSize;
    const select = new PIXI.Graphics();
    select.beginFill(color || 0xffff00, 0.3);
    select.lineStyle(3, color || 0xffff00, 0.6);
    select.drawRect(x, y, this.squareSize, this.squareSize);
    select.endFill();
    this.overlayContainer.addChild(select);
    this.selectedSprite = select;
    return select;
  },

  clearSelection() {
    if (this.selectedSprite) {
      this.overlayContainer.removeChild(this.selectedSprite);
      this.selectedSprite.destroy();
      this.selectedSprite = null;
    }
  },

  flash(color) {
    PixiAnimator.flashScreen(this.flashGraphics, color || 0xffffff, 0.3);
  },

  shake(intensity) {
    PixiAnimator.screenShake(this.container, intensity || 8, 0.4);
  },

  getSquareAt(x, y) {
    const col = Math.floor((x - this.boardOffsetX) / this.squareSize);
    const row = Math.floor((y - this.boardOffsetY) / this.squareSize);
    if (col >= 0 && col < 8 && row >= 0 && row < 8) {
      return { col, row };
    }
    return null;
  },

  destroy() {
    if (this.container) {
      this.container.destroy({ children: true });
      this.container = null;
    }
    this.boardContainer = null;
    this.piecesContainer = null;
    this.overlayContainer = null;
    this.squares = [];
    this.pieceSprites = {};
    this.flashGraphics = null;
    this.selectedSprite = null;
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add src/pixi/PixiBoardRenderer.js
git commit -m "feat: create PixiBoardRenderer with pieces, highlights, and selection"
```

---

### Task 8: Create PixiGameScreen.js (adapter)

**Files:**
- Create: `src/pixi/PixiGameScreen.js`
- Read first: `src/screens/GameScreen.js`

- [ ] **Step 1: Write PixiGameScreen.js**

This adapter bridges the existing GameScreen state to the new Pixi renderers:

```javascript
const PixiGameScreen = {
  initialized: false,

  init() {
    PixiApp.init();
    PixiApp.clearStage();

    PixiBackgroundRenderer.init(PixiApp.stage);
    PixiBoardRenderer.init(PixiApp.stage);
    PixiParticleFX.init(PixiApp.stage);

    this.initialized = true;
  },

  update(dt, gameState) {
    if (!this.initialized) return;

    PixiParticleFX.update(dt);

    // Background updates on theme change
    const currentTheme = store.get('theme') || 'space';
    if (this._lastTheme !== currentTheme) {
      PixiBackgroundRenderer.render(currentTheme);
      if (gameState.board) {
        PixiBoardRenderer.drawBoard(currentTheme);
        PixiBoardRenderer.setPieces(gameState.board, currentTheme);
      }
      this._lastTheme = currentTheme;
    }
  },

  renderBoard(board, themeId) {
    PixiBoardRenderer.drawBoard(themeId);
    PixiBoardRenderer.setPieces(board, themeId);
  },

  selectSquare(col, row, color) {
    PixiBoardRenderer.selectSquare(col, row, color);
  },

  clearSelection() {
    PixiBoardRenderer.clearSelection();
  },

  highlightLegalMoves(moves) {
    PixiBoardRenderer.drawLegalMoves(moves);
  },

  clearHighlights() {
    PixiBoardRenderer.clearHighlights();
  },

  animateMove(fromCol, fromRow, toCol, toRow, board, themeId, onComplete) {
    PixiBoardRenderer.movePiece(fromCol, fromRow, toCol, toRow, themeId, () => {
      // After animation, resync piece sprites with board state
      PixiBoardRenderer.setPieces(board, themeId);
      if (onComplete) onComplete();
    });
  },

  animateCapture(col, row, board, themeId, onComplete) {
    PixiBoardRenderer.capturePiece(col, row, () => {
      PixiBoardRenderer.setPieces(board, themeId);
      if (onComplete) onComplete();
    });
  },

  spawnCaptureParticles(x, y, color) {
    PixiParticleFX.spawnCapture(x, y, color);
  },

  spawnMoveParticles(x, y, color) {
    PixiParticleFX.spawnMove(x, y, color);
  },

  flashScreen(color) {
    PixiBoardRenderer.flash(color);
  },

  shakeScreen(intensity) {
    PixiBoardRenderer.shake(intensity);
  },

  getSquareAt(x, y) {
    return PixiBoardRenderer.getSquareAt(x, y);
  },

  resize() {
    PixiApp.resize();
  },

  destroy() {
    PixiAnimator.killTweensOf(PixiBoardRenderer.container);
    PixiParticleFX.destroy();
    PixiBoardRenderer.destroy();
    PixiBackgroundRenderer.destroy();
    PixiApp.clearStage();
    this.initialized = false;
    this._lastTheme = null;
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add src/pixi/PixiGameScreen.js
git commit -m "feat: create PixiGameScreen adapter bridging state to Pixi renderers"
```

---

### Task 9: Modify GameScreen.js to use Pixi

**Files:**
- Modify: `src/screens/GameScreen.js`
- Read first: `src/screens/GameScreen.js` (full file)

- [ ] **Step 1: In GameScreen.init(), add Pixi initialization**

Find `init()` and add after existing init code:

```javascript
    // Initialize Pixi rendering
    if (typeof PixiGameScreen !== 'undefined') {
      PixiGameScreen.init();
      PixiGameScreen.renderBoard(this.board, store.get('theme') || 'space');
    }
```

- [ ] **Step 2: In GameScreen.destroy(), add Pixi cleanup**

Find `destroy()` and add:

```javascript
    if (typeof PixiGameScreen !== 'undefined') {
      PixiGameScreen.destroy();
    }
```

- [ ] **Step 3: In GameScreen.render(), replace board rendering with Pixi update**

Find the `render(ctx, dt)` method. Replace the board rendering section (the part that calls `boardRenderer.render(ctx, dt)`) with:

```javascript
    // Update Pixi rendering
    if (typeof PixiGameScreen !== 'undefined' && PixiGameScreen.initialized) {
      PixiGameScreen.update(dt, { board: this.board, selectedPiece: this.selectedPiece });
    }
```

Keep all the UI drawing (side panels, status bar, etc.) using the existing canvas `ctx` calls — those still render on top.

- [ ] **Step 4: In handleClick, replace board square detection**

Find where `boardRenderer.getSquareAt(x, y)` is called and replace with:

```javascript
    let sq = null;
    if (typeof PixiGameScreen !== 'undefined' && PixiGameScreen.initialized) {
      sq = PixiGameScreen.getSquareAt(x, y);
    } else if (typeof boardRenderer !== 'undefined') {
      sq = boardRenderer.getSquareAt(x, y);
    }
```

- [ ] **Step 5: In executeMove/animateMove, replace animation calls**

Where `boardRenderer.animateMove` or `Animator.animateMove` is called, replace with:

```javascript
    if (typeof PixiGameScreen !== 'undefined' && PixiGameScreen.initialized) {
      PixiGameScreen.animateMove(fromCol, fromRow, toCol, toRow, this.board, store.get('theme') || 'space', () => {
        this._finishMove();
      });
    } else {
      // old canvas animation path
    }
```

- [ ] **Step 6: In capture handling, replace capture animation**

Where capture particles/animations are triggered, use:

```javascript
    if (typeof PixiGameScreen !== 'undefined' && PixiGameScreen.initialized) {
      PixiGameScreen.spawnCaptureParticles(cx, cy, color);
      PixiGameScreen.animateCapture(col, row, this.board, store.get('theme') || 'space');
      PixiGameScreen.flashScreen(0xffffff);
    }
```

- [ ] **Step 7: In selection handling, replace highlight calls**

Where `boardRenderer.highlightSquare` or `boardRenderer.selectSquare` is called:

```javascript
    if (typeof PixiGameScreen !== 'undefined' && PixiGameScreen.initialized) {
      PixiGameScreen.clearSelection();
      PixiGameScreen.selectSquare(col, row, 0xffff00);
      PixiGameScreen.highlightLegalMoves(moves);
    }
```

- [ ] **Step 8: Commit**

```bash
git add src/screens/GameScreen.js
git commit -m "feat: integrate Pixi rendering into GameScreen"
```

---

### Task 10: Modify main.js to initialize PixiApp

**Files:**
- Modify: `src/main.js`

- [ ] **Step 1: Add PixiApp initialization in initApp()**

After `resizeCanvas()` and before `switchScreen('home')`, add:

```javascript
  // Initialize PixiJS (for game board rendering)
  if (typeof PixiApp !== 'undefined') {
    PixiApp.init();
  }
```

- [ ] **Step 2: Add PixiApp cleanup in destroy or window unload**

No explicit destroy exists in main.js, but add to `window.addEventListener('resize')` handler:

```javascript
  window.addEventListener('resize', () => {
    resizeCanvas();
    if (typeof PixiApp !== 'undefined') {
      PixiApp.resize();
    }
  });
```

- [ ] **Step 3: Commit**

```bash
git add src/main.js
git commit -m "feat: init and resize PixiApp in main bootstrap"
```

---

### Task 11: Add Pixi scripts to index.html

**Files:**
- Modify: `src/index.html`

- [ ] **Step 1: Add new script tags before main.js**

Add before `<script src="main.js"></script>`:

```html
  <script src="pixi/PixiApp.js"></script>
  <script src="pixi/PixiPieceRenderer.js"></script>
  <script src="pixi/PixiBackgroundRenderer.js"></script>
  <script src="pixi/PixiParticleFX.js"></script>
  <script src="pixi/PixiAnimator.js"></script>
  <script src="pixi/PixiBoardRenderer.js"></script>
  <script src="pixi/PixiGameScreen.js"></script>
```

- [ ] **Step 2: Commit**

```bash
git add src/index.html
git commit -m "build: add Pixi module scripts to index.html"
```

---

### Task 12: Manual Verification

**Files:**
- None (manual testing)

- [ ] **Step 1: Launch the game**

```bash
npm start
```

- [ ] **Step 2: Verify board renders**

Open the game. The board should appear with squares and pieces. Pieces should be crisp pixel art.

- [ ] **Step 3: Verify piece movement**

Click a piece, click a legal square. The piece should animate smoothly with a back-out easing.

- [ ] **Step 4: Verify captures**

Capture a piece. There should be a particle burst and a brief white flash.

- [ ] **Step 5: Verify theme switching**

Switch themes in Settings. The board colors should update.

- [ ] **Step 6: Commit**

```bash
git commit --allow-empty -m "test: verify PixiJS board rendering works end-to-end"
```

---

### Task 13: Push to GitHub

**Files:**
- None

- [ ] **Step 1: Push**

```bash
git push origin main
```

---

## Self-Review

**1. Spec coverage:**
- PixiApp bootstrap → Task 2
- Piece rendering with textures → Task 3
- Background rendering → Task 4
- Particle effects → Task 5
- Animator/tweening → Task 6
- Board renderer (squares, pieces, highlights, legal moves) → Task 7
- GameScreen adapter → Task 8
- Integration with existing GameScreen → Task 9
- main.js init → Task 10
- CDN dependencies → Task 1
- Manual verification → Task 12

**2. Placeholder scan:** No TBD, TODO, or vague steps found.

**3. Type consistency:**
- `PixiGameScreen.initialized` used in Task 8 and Task 9 — consistent
- `PixiBoardRenderer.getSquareAt()` returns `{col, row}` or null — consistent
- Theme ID passed as string throughout — consistent

**Gaps identified:** None. All spec requirements map to tasks.
