class PatternPress {
  constructor() {
    this.name = 'Pattern Press';
    this.done = false;
    this.winner = null;
    this.sequence = [];
    this.playerSequence = [];
    this.showing = false;
    this.showIndex = 0;
    this.showTimer = 0;
    this.waitingForInput = false;
    this.currentStep = 0;
    this.length = 0;
    this.maxLength = 6;
    this.colors = ['#ff4444', '#44ff44', '#4444ff', '#ffff44'];
    this.keys = ['q', 'w', 'e', 'r'];
    // Visual polish state
    this.shakeTimer = 0;
    this.shakeX = 0;
    this.shakeY = 0;
    this.particles = [];
    this.pulsePhase = 0;
  }

  init(attacker, defender) {
    this.done = false;
    this.winner = null;
    this.sequence = [];
    this.playerSequence = [];
    this.showing = false;
    this.waitingForInput = false;
    this.currentStep = 0;
    this.length = 3;
    this.shakeTimer = 0;
    this.shakeX = 0;
    this.shakeY = 0;
    this.particles = [];
    this.pulsePhase = 0;

    this.generateSequence();
    this.startShow();
  }

  generateSequence() {
    this.sequence = [];
    for (let i = 0; i < this.length; i++) {
      this.sequence.push(Math.floor(Math.random() * 4));
    }
  }

  startShow() {
    this.showing = true;
    this.showIndex = 0;
    this.showTimer = 0;
  }

  update(dt) {
    if (this.done) return;

    // Pulse phase for active button glow
    this.pulsePhase += dt * 8;

    // Shake decay
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      if (this.shakeTimer < 0) this.shakeTimer = 0;
      const intensity = this.shakeTimer / 0.15;
      this.shakeX = (Math.random() - 0.5) * 8 * intensity;
      this.shakeY = (Math.random() - 0.5) * 8 * intensity;
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
    }

    // Particle update
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 120 * dt; // gravity
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    if (this.showing) {
      this.showTimer += dt;
      if (this.showTimer > 0.6) {
        this.showTimer = 0;
        this.showIndex++;
        if (this.showIndex >= this.sequence.length) {
          this.showing = false;
          this.waitingForInput = true;
          this.currentStep = 0;
          this.playerSequence = [];
        }
      }
    }
  }

  handleKey(key) {
    if (!this.waitingForInput || this.done) return;

    const idx = this.keys.indexOf(key.toLowerCase());
    if (idx === -1) return;

    this.playerSequence.push(idx);
    this.currentStep++;

    if (idx === this.sequence[this.currentStep - 1]) {
      audioManager.playTone(600 + idx * 100, 0.1, 'square', 0.08);
      if (this.currentStep >= this.sequence.length) {
        // Spawn celebration particles
        this.spawnParticles(idx);
        // Completed the sequence
        this.length++;
        if (this.length > this.maxLength) {
          this.done = true;
          this.winner = 'attacker';
          audioManager.playMiniGameWin();
        } else {
          this.waitingForInput = false;
          setTimeout(() => {
            this.generateSequence();
            this.startShow();
          }, 500);
        }
      }
    } else {
      // Wrong! Trigger shake
      this.shakeTimer = 0.15;
      this.shakeX = (Math.random() - 0.5) * 8;
      this.shakeY = (Math.random() - 0.5) * 8;
      this.done = true;
      this.winner = 'defender';
      audioManager.playMiniGameLose();
    }
  }

  spawnParticles(btnIdx) {
    const btnSize = 60;
    const gap = 15;
    const totalW = 4 * (btnSize + gap) - gap;
    const overlayX = Math.floor((1280 - 700) / 2);
    const overlayY = Math.floor((800 - 460) / 2);
    const gameX = overlayX + 20;
    const gameY = overlayY + 95;
    const startX = gameX + (660 - totalW) / 2;
    const startY = gameY + 90;
    const cx = startX + totalW / 2;
    const cy = startY + btnSize / 2;
    const color = this.colors[btnIdx];

    for (let i = 0; i < 10; i++) {
      const angle = (Math.PI * 2 / 10) * i + (Math.random() - 0.5) * 0.5;
      const speed = 100 + Math.random() * 150;
      this.particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 60,
        life: 0.6 + Math.random() * 0.4,
        maxLife: 0.6 + Math.random() * 0.4,
        color: color,
        size: 3 + Math.random() * 4,
      });
    }
  }

  // Helper: draw a rounded rectangle path
  roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  darkenColor(hex, amt) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${Math.floor(r * amt)},${Math.floor(g * amt)},${Math.floor(b * amt)})`;
  }

  lightenColor(hex, amt) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${Math.min(255, Math.floor(r + (255 - r) * amt))},${Math.min(255, Math.floor(g + (255 - g) * amt))},${Math.min(255, Math.floor(b + (255 - b) * amt))})`;
  }

  render(ctx, x, y, w, h) {
    const theme = ThemeManager.getTheme(store.get('theme'));
    const cols = theme.colors;

    ctx.save();

    // Apply shake offset
    ctx.translate(this.shakeX, this.shakeY);

    // Background panel
    ctx.fillStyle = cols.panel || '#1a1a2e';
    this.roundRect(ctx, x, y, w, h, 12);
    ctx.fill();

    // Subtle grid pattern
    ctx.save();
    ctx.clip(); // clip to the rounded rect
    ctx.strokeStyle = (cols.text || '#ffffff') + '0a';
    ctx.lineWidth = 1;
    const gridSize = 28;
    for (let gx = x; gx < x + w; gx += gridSize) {
      ctx.beginPath();
      ctx.moveTo(gx, y);
      ctx.lineTo(gx, y + h);
      ctx.stroke();
    }
    for (let gy = y; gy < y + h; gy += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, gy);
      ctx.lineTo(x + w, gy);
      ctx.stroke();
    }
    ctx.restore();

    // Border
    ctx.strokeStyle = cols.accent;
    ctx.lineWidth = 3;
    this.roundRect(ctx, x, y, w, h, 12);
    ctx.stroke();

    // Title
    ctx.fillStyle = cols.text;
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PATTERN PRESS', x + w / 2, y + 35);

    // Subtitle
    ctx.font = '11px monospace';
    ctx.fillStyle = cols.text + '88';
    ctx.fillText('Repeat the pattern! Length: ' + this.length + '/' + this.maxLength, x + w / 2, y + 55);

    // Color buttons — rounded gradient with shadow and pulse
    const btnSize = 60;
    const gap = 15;
    const totalW = 4 * (btnSize + gap) - gap;
    const startX = x + (w - totalW) / 2;
    const startY = y + 90;
    const cornerR = 10;

    for (let i = 0; i < 4; i++) {
      const bx = startX + i * (btnSize + gap);
      const by = startY;

      const isActive = this.showing && this.showIndex < this.sequence.length &&
                       i === this.sequence[this.showIndex] &&
                       Math.floor(this.showTimer / 0.3) % 2 === 0;

      // Pulse scale for active button
      let scale = 1;
      let glowBlur = 0;
      if (isActive) {
        scale = 1.05;
        glowBlur = 8 + Math.sin(this.pulsePhase) * 3.5; // oscillate 8-15 (approx)
      }

      const cx = bx + btnSize / 2;
      const cy = by + btnSize / 2;

      ctx.save();

      // Scale from center
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      ctx.translate(-cx, -cy);

      // Shadow underneath
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
      ctx.fillStyle = 'rgba(0,0,0,0.01)'; // need fill for shadow to render
      this.roundRect(ctx, bx, by, btnSize, btnSize, cornerR);
      ctx.fill();
      ctx.restore();

      // Gradient fill
      const baseColor = isActive ? this.colors[i] : this.darkenColor(this.colors[i], 0.5);
      const topColor = isActive ? this.lightenColor(this.colors[i], 0.3) : this.darkenColor(this.colors[i], 0.65);
      const grad = ctx.createLinearGradient(bx, by, bx, by + btnSize);
      grad.addColorStop(0, topColor);
      grad.addColorStop(1, baseColor);

      // Glow for active
      if (isActive) {
        ctx.shadowColor = this.colors[i];
        ctx.shadowBlur = glowBlur;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }

      ctx.fillStyle = grad;
      this.roundRect(ctx, bx, by, btnSize, btnSize, cornerR);
      ctx.fill();

      // Reset shadow before stroke
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // Subtle border
      ctx.strokeStyle = (cols.text || '#ffffff') + '33';
      ctx.lineWidth = 1;
      this.roundRect(ctx, bx, by, btnSize, btnSize, cornerR);
      ctx.stroke();

      // Key label
      ctx.fillStyle = isActive ? '#fff' : cols.text + '88';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.keys[i].toUpperCase(), cx, cy);

      ctx.restore();
    }

    // Sequence display and progress dots
    if (this.waitingForInput) {
      ctx.fillStyle = cols.text;
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Your turn! Repeat the pattern', x + w / 2, startY + btnSize + 30);

      // Progress dots below buttons
      const progressY = startY + btnSize + 55;
      const dotSpacing = 22;
      const dotsTotalW = this.sequence.length * dotSpacing;
      const dotStartX = x + w / 2 - dotsTotalW / 2 + dotSpacing / 2;

      for (let i = 0; i < this.sequence.length; i++) {
        const dotX = dotStartX + i * dotSpacing;
        const filled = i < this.playerSequence.length;
        const dotColor = filled ? this.colors[this.playerSequence[i]] : (cols.text + '44');

        if (filled) {
          // Filled dot with a subtle glow
          ctx.save();
          ctx.shadowColor = this.colors[this.playerSequence[i]];
          ctx.shadowBlur = 6;
          ctx.fillStyle = dotColor;
          ctx.beginPath();
          ctx.arc(dotX, progressY, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else {
          // Empty dot outline
          ctx.strokeStyle = (cols.text || '#ffffff') + '44';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(dotX, progressY, 7, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }

    // Particles
    for (const p of this.particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Done message
    if (this.done) {
      ctx.fillStyle = cols.accent;
      ctx.font = 'bold 18px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.winner === 'attacker' ? 'YOU WIN!' : 'Defender wins!', x + w / 2, y + 250);
    }

    ctx.restore();
  }

  botPlay(dt, timer) {
    if (!this.waitingForInput || this.done) return;
    if (!this.botSequence) this.botSequence = [];

    // Watch the pattern
    if (this.showing && this.showIndex < this.sequence.length) {
      if (!this.botSequence.includes(this.showIndex)) {
        this.botSequence.push(this.showIndex);
      }
      return;
    }

    // Replay pattern with slight delay
    if (this.waitingForInput && this.currentStep < this.sequence.length) {
      const key = this.keys[this.sequence[this.currentStep]];
      this.handleKey(key);
    }
  }

  handleClick(screenX, screenY) {
    if (!this.waitingForInput || this.done) return;

    const btnSize = 60;
    const gap = 15;
    const totalW = 4 * (btnSize + gap) - gap;
    // Use screen coords - game render area is at overlayX+20, overlayY+95
    const overlayX = Math.floor((1280 - 700) / 2);
    const overlayY = Math.floor((800 - 460) / 2);
    const gameX = overlayX + 20;
    const gameY = overlayY + 95;
    const startX = gameX + (660 - totalW) / 2;
    const startY = gameY + 90;

    for (let i = 0; i < 4; i++) {
      const bx = startX + i * (btnSize + gap);
      const by = startY;
      if (screenX >= bx && screenX <= bx + btnSize && screenY >= by && screenY <= by + btnSize) {
        this.handleKey(this.keys[i]);
        return;
      }
    }
  }
}