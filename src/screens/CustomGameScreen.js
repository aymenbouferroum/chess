const CustomGameScreen = {
  isPixiScreen: true,
  pixiContainer: null,
  eloValue: 1000,
  playAs: 'white',
  minigameToggles: {},

  minigameList: [
    { key: 'quickClick', name: 'Quick Click' },
    { key: 'memoryMatch', name: 'Memory Match' },
    { key: 'timingStrike', name: 'Timing Strike' },
    { key: 'patternPress', name: 'Pattern Press' },
    { key: 'reactionTest', name: 'Reaction Test' },
    { key: 'undertaleDodge', name: 'Soul Dodge' },
    { key: 'powerMeter', name: 'Power Meter' },
    { key: 'targetPractice', name: 'Target Practice' },
    { key: 'dodgeFalling', name: 'Dodge Falling' },
    { key: 'rhythmTap', name: 'Rhythm Tap' },
    { key: 'numberGuess', name: 'Number Guess' },
    { key: 'coinFlip', name: 'Coin Flip' },
    { key: 'barBalance', name: 'Bar Balance' },
    { key: 'shieldBlock', name: 'Shield Block' },
    { key: 'whackMole', name: 'Whack-a-Mole' },
  ],

  init() {
    const stored = store.get('customElo');
    this.eloValue = stored || (200 + ((store.get('customDifficulty') || 5) - 1) * 200);
    this.playAs = store.get('customPlayAs') || 'white';
    this.minigameToggles = { ...(store.get('customMinigames') || {}) };
    for (const game of this.minigameList) {
      if (this.minigameToggles[game.key] === undefined) this.minigameToggles[game.key] = true;
    }
    this.build();
  },

  destroy() {
    PixiPremiumScene.destroy(this);
  },

  pixiUpdate(dt) {
    PixiPremiumScene.update(this.pixiContainer, dt);
  },

  eloToDifficulty(elo) {
    return Math.max(1, Math.min(10, Math.round((elo - 200) / 200) + 1));
  },

  eloToName(elo) {
    if (elo <= 400) return 'Beginner';
    if (elo <= 600) return 'Novice';
    if (elo <= 800) return 'Casual';
    if (elo <= 1000) return 'Intermediate';
    if (elo <= 1200) return 'Skilled';
    if (elo <= 1400) return 'Advanced';
    if (elo <= 1600) return 'Expert';
    if (elo <= 1800) return 'Master';
    if (elo <= 1900) return 'Grandmaster';
    return 'Chess 2.0';
  },

  build() {
    if (this.pixiContainer) this.pixiContainer.destroy({ children: true });
    this.pixiContainer = PixiPremiumScene.root('Custom Game', 'Tune the bot and capture challenges', { footerHint: `${this.eloValue} ELO | ${this.eloToName(this.eloValue)} | ${this.enabledCount()} minigames active` });
    PixiScreenManager.setScreenContainer(this.pixiContainer);

    this.buildConfigPanel();
    this.buildMinigameGrid();
    PixiPremiumScene.button(this.pixiContainer, 36, 718, 160, 44, 'Back', () => switchScreen('home'), { icon: 'back' });
    PixiPremiumScene.button(this.pixiContainer, 1020, 710, 220, 58, 'Start Game', () => this.startGame(), { primary: true, icon: 'play', fontSize: 22 });
  },

  buildConfigPanel() {
    const cols = ThemeManager.getCurrentColors();
    PixiPremiumScene.panel(this.pixiContainer, 78, 132, 1124, 154, { accentAlpha: 0.45 });

    const label = PixiPremiumScene.text('Bot Difficulty', { fontSize: 23, fontWeight: '900', fill: cols.text });
    label.x = 116;
    label.y = 164;
    this.pixiContainer.addChild(label);
    const elo = PixiPremiumScene.text(`${this.eloValue} ELO`, { fontSize: 24, fontWeight: '900', fill: cols.accent });
    elo.x = 116;
    elo.y = 202;
    this.pixiContainer.addChild(elo);
    const name = PixiPremiumScene.text(this.eloToName(this.eloValue), { fontSize: 16, fill: PixiPremiumScene.alpha(cols.text, 'aa') });
    name.x = 248;
    name.y = 208;
    this.pixiContainer.addChild(name);

    const slider = new PixiSlider({
      width: 560,
      height: 18,
      min: 200,
      max: 2000,
      step: 50,
      value: this.eloValue,
      cols,
      gradientStops: [
        { pos: 0, color: '#7dea99' },
        { pos: 0.45, color: cols.accent },
        { pos: 1, color: '#ff6578' },
      ],
      showTicks: true,
      tickInterval: 300,
    });
    slider.x = 400;
    slider.y = 202;
    slider.onChange((value) => {
      this.eloValue = value;
      elo.text = `${value} ELO`;
      name.text = this.eloToName(value);
    });
    this.pixiContainer.addChild(slider);

    ['white', 'black'].forEach((color, i) => {
      PixiPremiumScene.button(this.pixiContainer, 994 + i * 94, 190, 82, 42, color === 'white' ? 'White' : 'Black', () => {
        this.playAs = color;
        this.build();
      }, { primary: this.playAs === color, fontSize: 16 });
    });
  },

  buildMinigameGrid() {
    const cols = ThemeManager.getCurrentColors();
    PixiPremiumScene.panel(this.pixiContainer, 78, 316, 1124, 368, { accentAlpha: 0.35 });
    const heading = PixiPremiumScene.text('Capture Mini-Games', { fontSize: 22, fontWeight: '900', fill: cols.text });
    heading.x = 112;
    heading.y = 340;
    this.pixiContainer.addChild(heading);

    PixiPremiumScene.button(this.pixiContainer, 968, 336, 86, 30, 'All On', () => {
      this.minigameList.forEach(game => { this.minigameToggles[game.key] = true; });
      this.build();
    }, { fontSize: 13 });
    PixiPremiumScene.button(this.pixiContainer, 1064, 336, 86, 30, 'All Off', () => {
      this.minigameList.forEach(game => { this.minigameToggles[game.key] = false; });
      this.build();
    }, { fontSize: 13 });

    this.minigameList.forEach((game, i) => {
      const col = i % 5;
      const row = Math.floor(i / 5);
      const x = 112 + col * 214;
      const y = 386 + row * 88;
      const on = this.minigameToggles[game.key] !== false;
      PixiPremiumScene.card(this.pixiContainer, x, y, 192, 72, {
        active: on,
        activeColor: on ? cols.accent : '#ff6578',
        onClick: () => {
          this.minigameToggles[game.key] = !on;
          this.build();
        },
        draw: (card) => {
          const thumb = new PIXI.Sprite(PixiPremiumAssets.minigame(game.key));
          thumb.width = 74;
          thumb.height = 44;
          thumb.x = 14;
          thumb.y = 14;
          thumb.alpha = on ? 1 : 0.42;
          card.addChild(thumb);
          const title = PixiPremiumScene.text(game.name, { fontSize: 15, fontWeight: '900', fill: on ? cols.text : PixiPremiumScene.alpha(cols.text, '66') });
          title.x = 100;
          title.y = 18;
          PixiPremiumScene.fit(title, 76, 0.55);
          card.addChild(title);
          const state = PixiPremiumScene.text(on ? 'ON' : 'OFF', { fontSize: 13, fontWeight: '900', fill: on ? cols.accent : '#ff6578' });
          state.x = 100;
          state.y = 44;
          card.addChild(state);
        },
      });
    });
  },

  enabledCount() {
    return Object.values(this.minigameToggles).filter(Boolean).length;
  },

  startGame() {
    store.set('customElo', this.eloValue);
    store.set('customDifficulty', this.eloToDifficulty(this.eloValue));
    store.set('customPlayAs', this.playAs);
    store.set('customMinigames', { ...this.minigameToggles });
    store.set('mode', 'custom');
    store.set('p1IsWhite', this.playAs === 'white');
    store.set('miniGamesEnabled', this.enabledCount() > 0);
    store.saveProgress();
    switchScreen('game');
  },

  handleKeyDown(e) {
    if (e.key === 'Escape') switchScreen('home');
    if (e.key === 'Enter') this.startGame();
  },
};
