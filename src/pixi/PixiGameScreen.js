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

    // Sync highlights
    if (gameState.selectedSquare) {
      const key = `${gameState.selectedSquare.col},${gameState.selectedSquare.row}`;
      if (this._lastSelection !== key) {
        PixiBoardRenderer.clearHighlights();
        PixiBoardRenderer.selectSquare(gameState.selectedSquare.col, gameState.selectedSquare.row, 0xffff00);
        if (gameState.legalMoves) {
          PixiBoardRenderer.drawLegalMoves(gameState.legalMoves);
        }
        this._lastSelection = key;
      }
    } else if (this._lastSelection) {
      PixiBoardRenderer.clearHighlights();
      this._lastSelection = null;
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

  spawnCaptureParticles(x, y, color, pieceType) {
    PixiParticleFX.spawnCaptureExplosion(x, y, color, pieceType || 'pawn');
  },

  spawnMoveParticles(x, y, color) {
    PixiParticleFX.spawnMove(x, y, color);
  },

  spawnFireworks(x, y, colors) {
    PixiParticleFX.spawnFireworks(x, y, colors);
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
