const DialogueManager = {
  _cooldownMs: 8000,
  _lastShownTime: 0,
  _usedLines: new Set(),
  _character: null,
  _active: false,
  _onShow: null,
  _thinkTimer: null,
  _triggeredMilestones: new Set(),
  _lowHealthTriggered: false,
  _playerLowHealthTriggered: false,

  MATERIAL_VALUES: { pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9 },
  STARTING_MATERIAL: 39,
  LOW_HEALTH_THRESHOLD: 0.6,

  init(character, onShowCallback) {
    this._character = character;
    this._onShow = onShowCallback;
    this._active = true;
    this._lastShownTime = 0;
    this._usedLines = new Set();
    this._thinkTimer = null;
    this._triggeredMilestones = new Set();
    this._lowHealthTriggered = false;
    this._playerLowHealthTriggered = false;
  },

  destroy() {
    this._active = false;
    this._character = null;
    this._onShow = null;
    if (this._thinkTimer) {
      clearTimeout(this._thinkTimer);
      this._thinkTimer = null;
    }
    this._usedLines.clear();
    this._triggeredMilestones.clear();
  },

  onGameStart() {
    this._tryShow('gameStart');
  },

  onCapture(capturingColor, capturedPiece, aiColor) {
    if (!this._active) return;
    if (capturingColor === aiColor) {
      this._tryShow('bossCapture');
    } else {
      this._tryShow('playerCapture');
    }
  },

  onCheck(checkedColor, aiColor) {
    if (!this._active) return;
    if (checkedColor !== aiColor) {
      this._tryShow('bossCheck');
    } else {
      this._tryShow('playerCheck');
    }
  },

  onMoveComplete(moveNumber, board, aiColor) {
    if (!this._active) return;
    if (moveNumber === 10 && !this._triggeredMilestones.has(10)) {
      this._triggeredMilestones.add(10);
      this._tryShow('milestone');
      return;
    }
    if (moveNumber === 20 && !this._triggeredMilestones.has(20)) {
      this._triggeredMilestones.add(20);
      this._tryShow('milestone');
      return;
    }
    if (board) this._checkMaterial(board, aiColor);
  },

  onAIThinkStart() {
    if (!this._active) return;
    if (this._thinkTimer) clearTimeout(this._thinkTimer);
    this._thinkTimer = setTimeout(() => {
      this._tryShow('bossTaunt');
      this._thinkTimer = null;
    }, 3000);
  },

  onAIThinkEnd() {
    if (this._thinkTimer) {
      clearTimeout(this._thinkTimer);
      this._thinkTimer = null;
    }
  },

  _checkMaterial(board, aiColor) {
    const playerColor = aiColor === 'white' ? 'black' : 'white';
    let bossMat = 0;
    let playerMat = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board.grid[r][c];
        if (!piece || piece.type === 'king') continue;
        const val = this.MATERIAL_VALUES[piece.type] || 0;
        if (piece.color === aiColor) bossMat += val;
        else if (piece.color === playerColor) playerMat += val;
      }
    }

    if (!this._lowHealthTriggered && bossMat < this.STARTING_MATERIAL * this.LOW_HEALTH_THRESHOLD) {
      this._lowHealthTriggered = true;
      this._tryShow('lowHealth');
    } else if (!this._playerLowHealthTriggered && playerMat < this.STARTING_MATERIAL * this.LOW_HEALTH_THRESHOLD) {
      this._playerLowHealthTriggered = true;
      this._tryShow('playerLowHealth');
    }
  },

  _tryShow(category) {
    if (!this._active || !this._character || !this._onShow) return;
    const gd = this._character.gameDialogue;
    if (!gd || !gd[category]) return;

    const now = Date.now();
    if (now - this._lastShownTime < this._cooldownMs) return;

    const line = this._pickLine(gd[category], category);
    if (!line) return;

    this._lastShownTime = now;
    this._onShow(line, this._character);
  },

  _pickLine(lines, category) {
    const unused = lines.filter((l, i) => !this._usedLines.has(category + i));
    if (unused.length > 0) {
      const idx = Math.floor(Math.random() * unused.length);
      const picked = unused[idx];
      const origIdx = lines.indexOf(picked);
      this._usedLines.add(category + origIdx);
      return picked;
    }
    return lines[Math.floor(Math.random() * lines.length)];
  },
};
