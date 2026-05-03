class MemoryMatch {
  constructor() {
    this.name = 'Memory Match';
    this.done = false;
    this.winner = null;
    this.cards = [];
    this.flipped = [];
    this.matched = [];
    this.canFlip = true;
    this.attempts = 0;
    this.maxAttempts = 8;
    this.pairs = 0;
    this.totalPairs = 4;
  }

  init(attacker, defender) {
    this.done = false;
    this.winner = null;
    this.flipped = [];
    this.matched = [];
    this.canFlip = true;
    this.attempts = 0;
    this.pairs = 0;
    this.totalPairs = 4;

    const symbols = ['♔', '♕', '♖', '♗'];
    this.cards = [...symbols, ...symbols];
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }

    audioManager.playMiniGameStart();
  }

  update(dt) {
    if (this.done) return;
    if (this.matched.length === this.totalPairs * 2) {
      this.done = true;
      this.winner = this.attempts <= this.totalPairs + 2 ? 'attacker' : 'defender';
    }
    if (this.attempts >= this.maxAttempts && this.pairs < this.totalPairs) {
      this.done = true;
      this.winner = 'defender';
    }
  }

  botPlay(dt, timer) {
    if (this.done || !this.canFlip || this.flipped.length >= 2) return;
    if (!this.botMemory) this.botMemory = {};

    // Remember flipped cards
    for (const idx of this.flipped) {
      if (!(idx in this.botMemory)) this.botMemory[idx] = this.cards[idx];
    }

    // Find a match from memory
    for (const [i, sym] of Object.entries(this.botMemory)) {
      for (const [j, sym2] of Object.entries(this.botMemory)) {
        if (i !== j && sym === sym2 &&
            !this.matched.includes(Number(i)) && !this.matched.includes(Number(j)) &&
            !this.flipped.includes(Number(i)) && !this.flipped.includes(Number(j))) {
          this.handleClickAtIndex(Number(i));
          setTimeout(() => this.handleClickAtIndex(Number(j)), 500);
          return;
        }
      }
    }

    // Random guess
    if (timer > 0.3 && this.flipped.length < 2) {
      const unknown = [];
      for (let i = 0; i < this.cards.length; i++) {
        if (!this.matched.includes(i) && !this.flipped.includes(i)) unknown.push(i);
      }
      if (unknown.length > 0) {
        this.handleClickAtIndex(unknown[Math.floor(Math.random() * unknown.length)]);
      }
    }
  }

  handleClickAtIndex(idx) {
    const cardW = 55;
    const cardH = 65;
    const gap = 10;
    const overlayX = Math.floor((1280 - 700) / 2);
    const overlayY = Math.floor((800 - 460) / 2);
    const gameX = overlayX + 20;
    const gameY = overlayY + 95;
    const totalW = 4 * (cardW + gap) - gap;
    const startX = gameX + (660 - totalW) / 2;
    const startY = gameY + 80;
    const col = idx % 4;
    const row = Math.floor(idx / 4);
    const screenX = startX + col * (cardW + gap) + cardW / 2;
    const screenY = startY + row * (cardH + gap) + cardH / 2;
    this.handleClick(screenX, screenY);
  }

  handleClick(screenX, screenY) {
    if (!this.canFlip || this.done) return;

    const cardW = 55;
    const cardH = 65;
    const gap = 10;
    const gridW = 4;
    const gridH = 2;
    const totalW = gridW * (cardW + gap) - gap;
    const totalH = gridH * (cardH + gap) - gap;

    // Game render area bounds
    const overlayX = Math.floor((1280 - 700) / 2);
    const overlayY = Math.floor((800 - 460) / 2);
    const gameX = overlayX + 20;
    const gameY = overlayY + 95;
    const startX = gameX + (660 - totalW) / 2;
    const startY = gameY + 80;

    const col = Math.floor((screenX - startX) / (cardW + gap));
    const row = Math.floor((screenY - startY) / (cardH + gap));
    const idx = row * 4 + col;

    if (idx < 0 || idx >= this.cards.length) return;
    if (this.flipped.includes(idx) || this.matched.includes(idx)) return;

    this.flipped.push(idx);
    audioManager.playTone(500, 0.08, 'square', 0.05);

    if (this.flipped.length === 2) {
      this.attempts++;
      this.canFlip = false;
      const [a, b] = this.flipped;
      if (this.cards[a] === this.cards[b]) {
        this.matched.push(a, b);
        this.pairs++;
        this.flipped = [];
        this.canFlip = true;
        audioManager.playTone(800, 0.1, 'square', 0.08);
        if (this.pairs === this.totalPairs) {
          this.done = true;
          this.winner = this.attempts <= this.totalPairs + 2 ? 'attacker' : 'defender';
        }
      } else {
        setTimeout(() => {
          this.flipped = [];
          this.canFlip = true;
        }, 800);
      }
    }
  }

  render(ctx, x, y, w, h) {
    const theme = ThemeManager.getTheme(store.get('theme'));
    const cols = theme.colors;

    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = cols.accent;
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, w, h);

    ctx.fillStyle = cols.text;
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('MEMORY MATCH', x + w / 2, y + 35);

    ctx.font = '11px monospace';
    ctx.fillStyle = cols.text + '88';
    ctx.fillText('Match the pairs! Attempts: ' + this.attempts + '/' + this.maxAttempts, x + w / 2, y + 55);

    // Card grid
    const cardW = 55;
    const cardH = 65;
    const gap = 10;
    const gridW = 4;
    const gridH = 2;
    const totalW = gridW * (cardW + gap) - gap;
    const totalH = gridH * (cardH + gap) - gap;
    const startX = x + (w - totalW) / 2;
    const startY = y + 80;

    for (let i = 0; i < this.cards.length; i++) {
      const cx = startX + (i % 4) * (cardW + gap);
      const cy = startY + Math.floor(i / 4) * (cardH + gap);
      const isFlipped = this.flipped.includes(i) || this.matched.includes(i);

      if (isFlipped) {
        ctx.fillStyle = this.matched.includes(i) ? '#44aa44' : cols.buttonHover;
        ctx.fillRect(cx, cy, cardW, cardH);
        ctx.fillStyle = cols.text;
        ctx.font = '28px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(this.cards[i], cx + cardW / 2, cy + cardH / 2 + 8);
      } else {
        ctx.fillStyle = cols.buttonBg;
        ctx.fillRect(cx, cy, cardW, cardH);
        ctx.strokeStyle = cols.text + '44';
        ctx.lineWidth = 1;
        ctx.strokeRect(cx, cy, cardW, cardH);
        ctx.fillStyle = cols.text + '66';
        ctx.font = '20px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('?', cx + cardW / 2, cy + cardH / 2 + 7);
      }
    }

    // Progress
    ctx.fillStyle = cols.text + '66';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Pairs: ' + this.pairs + '/' + this.totalPairs, x + w / 2, y + 230);

    if (this.done) {
      ctx.fillStyle = cols.accent;
      ctx.font = 'bold 18px monospace';
      ctx.fillText(this.winner === 'attacker' ? 'YOU WIN!' : 'Defender wins!', x + w / 2, y + 265);
    }
  }
}
