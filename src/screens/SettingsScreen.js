const SettingsScreen = {
  isPixiScreen: true,
  pixiContainer: null,
  settings: null,
  editingOption: null,
  editText: '',
  confirmReset: false,

  init() {
    this.settings = { ...store.get('settings') };
    if (this.settings.musicVolume == null) this.settings.musicVolume = 0.5;
    if (this.settings.sfxVolume == null) this.settings.sfxVolume = 0.5;
    this.editingOption = null;
    this.editText = '';
    this.confirmReset = false;
    this.build();
  },

  destroy() {
    PixiPremiumScene.destroy(this);
  },

  pixiUpdate(dt) {
    PixiPremiumScene.update(this.pixiContainer, dt);
  },

  saveSettings() {
    store.set('settings', { ...this.settings });
    if (typeof audioManager !== 'undefined') {
      if (audioManager.setEnabled) audioManager.setEnabled(this.settings.audioEnabled);
      if (audioManager.setMusicVolume) audioManager.setMusicVolume(this.settings.musicVolume);
      if (audioManager.setSFXVolume) audioManager.setSFXVolume(this.settings.sfxVolume);
    }
    store.saveProgress();
  },

  build() {
    if (this.pixiContainer) this.pixiContainer.destroy({ children: true });
    this.pixiContainer = PixiPremiumScene.root('Settings', 'Audio, player names, controls, and progress', { footerHint: this.editingOption ? 'Type a name, Enter to save, Escape to cancel' : 'Settings persist automatically' });
    PixiScreenManager.setScreenContainer(this.pixiContainer);

    this.buildAudioPanel();
    this.buildProfilePanel();
    this.buildActionPanel();

    PixiPremiumScene.button(this.pixiContainer, 36, 718, 160, 44, 'Back', () => switchScreen('home'), { icon: 'back' });
    PixiPremiumScene.button(this.pixiContainer, 1084, 718, 160, 44, 'Themes', () => switchScreen('themeSelect', { returnTo: 'settings' }), { icon: 'spark' });
    if (this.confirmReset) this.buildResetModal();
  },

  buildAudioPanel() {
    const cols = ThemeManager.getCurrentColors();
    PixiPremiumScene.panel(this.pixiContainer, 76, 132, 552, 270, { accentAlpha: 0.48 });
    this.sectionTitle(108, 160, 'Audio Mix', 'Balanced sliders with no hidden hitboxes');

    this.addSlider(116, 236, 472, 'Music Volume', this.settings.musicVolume, (value) => {
      this.settings.musicVolume = value;
      this.saveSettings();
    });
    this.addSlider(116, 326, 472, 'SFX Volume', this.settings.sfxVolume, (value) => {
      this.settings.sfxVolume = value;
      this.saveSettings();
    });

    const toggleLabel = PixiPremiumScene.text('Audio Enabled', { fontSize: 17, fontWeight: '800', fill: cols.text });
    toggleLabel.x = 386;
    toggleLabel.y = 158;
    PixiPremiumScene.fit(toggleLabel, 130, 0.62);
    this.pixiContainer.addChild(toggleLabel);
    const toggle = new PixiToggle({ width: 58, height: 24, value: this.settings.audioEnabled !== false, cols });
    toggle.x = 548;
    toggle.y = 160;
    toggle.onChange((value) => {
      this.settings.audioEnabled = value;
      this.saveSettings();
    });
    this.pixiContainer.addChild(toggle);
  },

  buildProfilePanel() {
    const cols = ThemeManager.getCurrentColors();
    PixiPremiumScene.panel(this.pixiContainer, 660, 132, 544, 270, { accentAlpha: 0.48 });
    this.sectionTitle(692, 160, 'Players', 'Readable names with inline editing');
    this.nameRow(700, 230, 'Player 1 Name', 'whitePlayer', store.get('whitePlayer') || 'Player 1');
    this.nameRow(700, 310, 'Player 2 Name', 'blackPlayer', store.get('blackPlayer') || 'Player 2');

    const note = PixiPremiumScene.text('Names are UI-only and do not change save compatibility.', {
      fontSize: 15,
      fill: PixiPremiumScene.alpha(cols.text, '77'),
    });
    note.x = 704;
    note.y = 366;
    PixiPremiumScene.fit(note, 450);
    this.pixiContainer.addChild(note);
  },

  buildActionPanel() {
    PixiPremiumScene.panel(this.pixiContainer, 76, 432, 1128, 230, { accentAlpha: 0.42 });
    this.sectionTitle(108, 460, 'Game Tools', 'Practice, controls, and save maintenance');
    const actions = [
      { x: 174, label: 'Practice Mini-Games', sub: 'Try every capture challenge', icon: 'play', action: () => switchScreen('miniGamePractice') },
      { x: 498, label: 'Controls', sub: 'Tune mini-game sensitivity', icon: 'settings', action: () => switchScreen('controls') },
      { x: 822, label: 'Reset Progress', sub: 'Clear story slots and stats', icon: 'lock', action: () => { this.confirmReset = true; this.build(); } },
    ];
    actions.forEach(action => {
      PixiPremiumScene.card(this.pixiContainer, action.x, 522, 284, 92, {
        onClick: action.action,
        activeColor: action.label === 'Reset Progress' ? '#ff6578' : ThemeManager.getCurrentColors().accent,
        draw: (card) => {
          const cols = ThemeManager.getCurrentColors();
          const icon = new PIXI.Sprite(PixiPremiumAssets.icon(action.icon));
          icon.width = 52;
          icon.height = 52;
          icon.x = 18;
          icon.y = 20;
          card.addChild(icon);
          const label = PixiPremiumScene.text(action.label, { fontSize: 20, fontWeight: '900', fill: cols.text });
          label.x = 84;
          label.y = 20;
          PixiPremiumScene.fit(label, 174);
          card.addChild(label);
          const sub = PixiPremiumScene.text(action.sub, { fontSize: 14, fill: PixiPremiumScene.alpha(cols.text, '88') });
          sub.x = 84;
          sub.y = 50;
          PixiPremiumScene.fit(sub, 174, 0.55);
          card.addChild(sub);
        },
      });
    });
  },

  sectionTitle(x, y, title, subtitle) {
    const cols = ThemeManager.getCurrentColors();
    const t = PixiPremiumScene.text(title, { fontSize: 24, fontWeight: '900', fill: cols.text });
    t.x = x;
    t.y = y;
    this.pixiContainer.addChild(t);
    const s = PixiPremiumScene.text(subtitle, { fontSize: 15, fill: PixiPremiumScene.alpha(cols.text, '88') });
    s.x = x;
    s.y = y + 30;
    PixiPremiumScene.fit(s, 420);
    this.pixiContainer.addChild(s);
  },

  addSlider(x, y, width, label, value, onChange) {
    const cols = ThemeManager.getCurrentColors();
    const slider = new PixiSlider({
      width,
      height: 18,
      min: 0,
      max: 1,
      step: 0.01,
      value,
      cols,
      label,
      unit: '',
      gradientStops: [
        { pos: 0, color: PixiColorUtil.alpha(cols.text, '66') },
        { pos: 0.55, color: cols.accent },
        { pos: 1, color: '#7dea99' },
      ],
    });
    slider.x = x;
    slider.y = y;
    const percent = PixiPremiumScene.text(`${Math.round(value * 100)}%`, { fontSize: 18, fontWeight: '900', fill: cols.accent });
    percent.anchor.set(1, 0);
    percent.x = x + width;
    percent.y = y - 34;
    this.pixiContainer.addChild(percent);
    slider.onChange((v) => {
      percent.text = `${Math.round(v * 100)}%`;
      onChange(v);
    });
    this.pixiContainer.addChild(slider);
  },

  nameRow(x, y, label, key, value) {
    PixiPremiumScene.card(this.pixiContainer, x, y, 440, 54, {
      onClick: () => {
        this.editingOption = key;
        this.editText = store.get(key) || value;
        this.build();
      },
      draw: (card) => {
        const cols = ThemeManager.getCurrentColors();
        const l = PixiPremiumScene.text(label, { fontSize: 18, fontWeight: '800', fill: cols.text });
        l.x = 18;
        l.y = 16;
        card.addChild(l);
        const display = this.editingOption === key
          ? `${this.editText}${Math.floor(Date.now() / 500) % 2 === 0 ? '|' : ''}`
          : value;
        const v = PixiPremiumScene.text(display, { fontSize: 18, fill: this.editingOption === key ? cols.accent : PixiPremiumScene.alpha(cols.text, 'aa') });
        v.anchor.set(1, 0.5);
        v.x = 420;
        v.y = 29;
        PixiPremiumScene.fit(v, 180);
        card.addChild(v);
      },
    });
  },

  buildResetModal() {
    const cols = ThemeManager.getCurrentColors();
    const dim = new PIXI.Graphics().rect(0, 0, 1280, 800).fill({ color: 0x000000, alpha: 0.62 });
    this.pixiContainer.addChild(dim);
    PixiPremiumScene.panel(this.pixiContainer, 430, 278, 420, 224, { accent: '#ff6578', accentAlpha: 0.86, alpha: 0.92 });
    const icon = new PIXI.Sprite(PixiPremiumAssets.icon('lock'));
    icon.width = 58;
    icon.height = 58;
    icon.x = 611;
    icon.y = 302;
    this.pixiContainer.addChild(icon);
    const title = PixiPremiumScene.text('Reset all progress?', { fontSize: 25, fontWeight: '900', fill: cols.text });
    title.anchor.set(0.5);
    title.x = 640;
    title.y = 382;
    this.pixiContainer.addChild(title);
    const sub = PixiPremiumScene.text('This clears story saves, unlocks, and stats.', { fontSize: 17, fill: PixiPremiumScene.alpha(cols.text, 'aa') });
    sub.anchor.set(0.5);
    sub.x = 640;
    sub.y = 418;
    this.pixiContainer.addChild(sub);
    PixiPremiumScene.button(this.pixiContainer, 462, 450, 150, 40, 'Reset', () => {
      store.resetProgress();
      this.confirmReset = false;
      this.build();
    }, { primary: true, color: '#ff6578' });
    PixiPremiumScene.button(this.pixiContainer, 668, 450, 150, 40, 'Cancel', () => {
      this.confirmReset = false;
      this.build();
    });
  },

  commitEdit() {
    if (!this.editingOption) return;
    const clean = this.editText.trim() || (this.editingOption === 'whitePlayer' ? 'Player 1' : 'Player 2');
    store.set(this.editingOption, clean.slice(0, 18));
    store.saveProgress();
    this.editingOption = null;
    this.editText = '';
    this.build();
  },

  handleKeyDown(e) {
    if (this.editingOption) {
      if (e.key === 'Enter') {
        this.commitEdit();
        return;
      }
      if (e.key === 'Escape') {
        this.editingOption = null;
        this.editText = '';
        this.build();
        return;
      }
      if (e.key === 'Backspace') {
        this.editText = this.editText.slice(0, -1);
        this.build();
        return;
      }
      if (e.key.length === 1 && this.editText.length < 18) {
        this.editText += e.key;
        this.build();
      }
      return;
    }
    if (e.key === 'Escape') switchScreen('home');
  },
};
