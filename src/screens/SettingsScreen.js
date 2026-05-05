const SettingsScreen = {
  settings: null,
  selectedOption: 0,
  options: [],
  editingOption: null,
  editText: '',
  confirmReset: false,

  init() {
    this.settings = { ...store.get('settings') };
    this.editingOption = null;
    this.editText = '';
    this.confirmReset = false;
    this.buildOptions();
  },

  buildOptions() {
    this.options = [
      {
        label: 'Practice Mini-Games',
        value: () => '→',
        action: () => {
          switchScreen('miniGamePractice');
        },
      },
      {
        label: 'Audio',
        value: () => this.settings.audioEnabled ? 'ON' : 'OFF',
        toggle: () => {
          this.settings.audioEnabled = !this.settings.audioEnabled;
          store.set('settings', this.settings);
          audioManager.setEnabled(this.settings.audioEnabled);
          store.saveProgress();
        },
      },
      {
        label: 'Music Volume',
        value: () => Math.round((this.settings.musicVolume || 0.5) * 100) + '%',
        toggle: () => {
          const levels = [0, 0.25, 0.5, 0.75, 1];
          const current = this.settings.musicVolume || 0.5;
          const idx = levels.indexOf(current);
          this.settings.musicVolume = levels[(idx + 1) % levels.length];
          store.set('settings', this.settings);
          audioManager.setMusicVolume(this.settings.musicVolume);
          store.saveProgress();
        },
      },
      {
        label: 'SFX Volume',
        value: () => Math.round((this.settings.sfxVolume || 0.5) * 100) + '%',
        toggle: () => {
          const levels = [0, 0.25, 0.5, 0.75, 1];
          const current = this.settings.sfxVolume || 0.5;
          const idx = levels.indexOf(current);
          this.settings.sfxVolume = levels[(idx + 1) % levels.length];
          store.set('settings', this.settings);
          audioManager.setMasterVolume(this.settings.sfxVolume);
          store.saveProgress();
        },
      },
      {
        label: 'Player 1 Name',
        value: () => store.get('whitePlayer'),
        edit: () => {
          this.editingOption = 'whitePlayer';
          this.editText = store.get('whitePlayer') || 'Player 1';
        },
      },
      {
        label: 'Player 2 Name',
        value: () => store.get('blackPlayer'),
        edit: () => {
          this.editingOption = 'blackPlayer';
          this.editText = store.get('blackPlayer') || 'Player 2';
        },
      },
      {
        label: 'Reset Progress',
        value: () => '',
        action: () => {
          this.confirmReset = true;
        },
      },
    ];
    this.selectedOption = 0;
  },

  destroy() {},

  render(ctx, dt) {
    const theme = ThemeManager.getTheme(store.get('theme'));
    const cols = theme.colors;

    // Background - animated theme
    if (typeof backgroundRenderer !== 'undefined') {
      backgroundRenderer.render(ctx, dt);
    } else {
      ctx.fillStyle = cols.background;
      ctx.fillRect(0, 0, 1280, 800);
    }

    ctx.fillStyle = cols.text;
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SETTINGS', 640, 60);
    ctx.fillStyle = cols.text + '77';
    ctx.font = '12px monospace';
    ctx.fillText('Customize your experience', 640, 85);

    // Settings list
    const startY = 150;
    const lineH = 60;

    for (let i = 0; i < this.options.length; i++) {
      const opt = this.options[i];
      const y = startY + i * lineH;
      const isHover = i === this.selectedOption;
      const isEditing = this.editingOption === opt.label && (opt.label === 'Player 1 Name' || opt.label === 'Player 2 Name');

      // Background
      ctx.fillStyle = isHover ? cols.buttonHover : 'transparent';
      ctx.fillRect(300, y, 680, 50);

      // Border
      if (isHover) {
        ctx.fillStyle = cols.accent;
        ctx.fillRect(300, y, 3, 50);
      }

      // Label
      ctx.fillStyle = isHover ? cols.accent : cols.text;
      ctx.font = '18px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(opt.label, 320, y + 32);

      // Value
      if (isEditing) {
        // Inline text editor
        ctx.fillStyle = cols.panel;
        ctx.fillRect(700, y + 10, 200, 30);
        ctx.strokeStyle = cols.accent;
        ctx.lineWidth = 2;
        ctx.strokeRect(700, y + 10, 200, 30);
        ctx.fillStyle = cols.text;
        ctx.font = '14px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(this.editText + (Math.floor(Date.now() / 500) % 2 === 0 ? '|' : ''), 710, y + 30);
      } else if (opt.value) {
        const val = opt.value();
        ctx.fillStyle = cols.text + '88';
        ctx.font = '16px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(val, 960, y + 32);
      }
    }

    // Controls hint
    ctx.fillStyle = cols.text + '44';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    if (this.editingOption) {
      ctx.fillText('Type name. Enter to confirm, Escape to cancel.', 640, 750);
    } else {
      ctx.fillText('Click to toggle / edit. ESC to go back.', 640, 750);
    }

    // Back button
    UIHelpers.drawButton(ctx, 30, 730, 160, 40, '< Back', cols, { font: 'bold 14px monospace' });

    // Theme shortcut
    UIHelpers.drawButton(ctx, 1280 - 180, 730, 150, 40, 'Themes', cols, { font: 'bold 12px monospace' });

    // Reset confirmation dialog
    if (this.confirmReset) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, 1280, 800);

      ctx.fillStyle = cols.panel;
      ctx.fillRect(440, 300, 400, 180);
      ctx.strokeStyle = cols.accent;
      ctx.lineWidth = 3;
      ctx.strokeRect(440, 300, 400, 180);

      ctx.fillStyle = cols.text;
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Reset all progress?', 640, 350);
      ctx.fillStyle = cols.text + '88';
      ctx.font = '14px monospace';
      ctx.fillText('This cannot be undone.', 640, 380);

      UIHelpers.drawButton(ctx, 460, 420, 140, 40, 'Yes, Reset', cols, { font: 'bold 13px monospace' });
      UIHelpers.drawButton(ctx, 680, 420, 140, 40, 'Cancel', cols, { font: 'bold 13px monospace' });
    }
  },

  handleClick(x, y) {
    // Reset confirmation dialog
    if (this.confirmReset) {
      // Yes button
      if (x >= 460 && x <= 600 && y >= 420 && y <= 460) {
        store.resetProgress();
        this.confirmReset = false;
        this.buildOptions();
        return;
      }
      // Cancel button
      if (x >= 680 && x <= 820 && y >= 420 && y <= 460) {
        this.confirmReset = false;
        return;
      }
      return;
    }

    // Back
    if (x >= 30 && x <= 190 && y >= 730 && y <= 770) {
      switchScreen('home');
      return;
    }
    // Theme
    if (x >= 1280 - 180 && x <= 1280 - 30 && y >= 730 && y <= 770) {
      switchScreen('themeSelect', { returnTo: 'settings' });
      return;
    }

    // If editing, click outside the editor cancels
    if (this.editingOption) {
      this.editingOption = null;
      this.editText = '';
      return;
    }

    const startY = 150;
    const lineH = 60;
    for (let i = 0; i < this.options.length; i++) {
      const oy = startY + i * lineH;
      if (x >= 300 && x <= 980 && y >= oy && y <= oy + 50) {
        if (this.options[i].toggle) this.options[i].toggle();
        else if (this.options[i].edit) this.options[i].edit();
        else if (this.options[i].action) this.options[i].action();
        return;
      }
    }
  },

  handleMouseMove(x, y) {
    if (this.confirmReset || this.editingOption) return;
    this.selectedOption = -1;
    const startY = 150;
    const lineH = 60;
    for (let i = 0; i < this.options.length; i++) {
      const oy = startY + i * lineH;
      if (x >= 300 && x <= 980 && y >= oy && y <= oy + 50) {
        this.selectedOption = i;
        return;
      }
    }
  },

  handleKeyDown(e) {
    if (this.confirmReset) {
      if (e.key === 'Escape') this.confirmReset = false;
      return;
    }

    if (this.editingOption) {
      if (e.key === 'Enter') {
        const name = this.editText.trim();
        if (name) {
          store.set(this.editingOption, name);
          store.saveProgress();
        }
        this.editingOption = null;
        this.editText = '';
        return;
      }
      if (e.key === 'Escape') {
        this.editingOption = null;
        this.editText = '';
        return;
      }
      if (e.key === 'Backspace') {
        this.editText = this.editText.slice(0, -1);
        return;
      }
      // Only accept printable characters, max 12 chars
      if (e.key.length === 1 && this.editText.length < 12) {
        this.editText += e.key;
        return;
      }
      return;
    }

    if (e.key === 'Escape') {
      switchScreen('home');
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const dir = e.key === 'ArrowUp' ? -1 : 1;
      this.selectedOption = (this.selectedOption + dir + this.options.length) % this.options.length;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const opt = this.options[this.selectedOption];
      if (opt.toggle) opt.toggle();
      else if (opt.edit) opt.edit();
      else if (opt.action) opt.action();
    }
  },
};