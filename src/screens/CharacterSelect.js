const CharacterSelect = {
  isPixiScreen: true,
  pixiContainer: null,
  characters: [],
  phase: 'slots',
  selectedSlot: 0,
  selectedChar: null,

  init() {
    this.characters = CHARACTERS;
    this.phase = 'slots';
    this.selectedSlot = Math.max(0, (store.get('activeSaveSlot') || 1) - 1);
    this.selectedChar = null;
    this.build();
  },

  destroy() {
    PixiPremiumScene.destroy(this);
  },

  pixiUpdate(dt) {
    PixiPremiumScene.update(this.pixiContainer, dt);
  },

  build() {
    if (this.pixiContainer) this.pixiContainer.destroy({ children: true });
    const subtitle = this.phase === 'slots'
      ? 'Choose a save file'
      : this.phase === 'difficulty'
        ? 'Choose how the story scales'
        : 'Pick the next challenger';
    this.pixiContainer = PixiPremiumScene.root('Story Mode', subtitle, { footerHint: 'Story progress and save data stay unchanged' });
    PixiScreenManager.setScreenContainer(this.pixiContainer);

    if (this.phase === 'slots') this.buildSlots();
    if (this.phase === 'difficulty') this.buildDifficulty();
    if (this.phase === 'characters') this.buildCharacters();
    PixiPremiumScene.button(this.pixiContainer, 36, 718, 160, 44, this.phase === 'slots' ? 'Home' : 'Back', () => this.back(), { icon: 'back' });
  },

  buildSlots() {
    const saves = store.get('storySaves');
    const startX = 112;
    const y = 174;
    const w = 320;
    const h = 388;
    const gap = 48;
    saves.forEach((save, index) => {
      const isEmpty = !save.difficultyTier;
      PixiPremiumScene.card(this.pixiContainer, startX + index * (w + gap), y, w, h, {
        active: store.get('activeSaveSlot') === index + 1,
        activeColor: isEmpty ? ThemeManager.getCurrentColors().accent : (save.completed ? '#7dea99' : ThemeManager.getCurrentColors().accent),
        onClick: () => this.chooseSlot(index),
        draw: (card) => {
          const cols = ThemeManager.getCurrentColors();
          const title = PixiPremiumScene.text(`SAVE ${index + 1}`, {
            fontFamily: PixiTextStyles.FONT_TITLE,
            fontSize: 20,
            fontWeight: 'bold',
            fill: cols.accent,
          });
          title.anchor.set(0.5);
          title.x = w / 2;
          title.y = 44;
          card.addChild(title);

          const sigil = new PIXI.Graphics();
          sigil.roundRect(w / 2 - 52, 86, 104, 104, 14)
            .fill({ color: 0x071724, alpha: 0.72 })
            .roundRect(w / 2 - 52, 86, 104, 104, 14)
            .stroke({ color: PixiPremiumScene.color(isEmpty ? cols.accent : '#7dea99'), alpha: 0.78, width: 3 });
          if (isEmpty) {
            sigil.rect(w / 2 - 8, 112, 16, 52).fill({ color: PixiPremiumScene.color(cols.accent), alpha: 0.92 });
            sigil.rect(w / 2 - 26, 130, 52, 16).fill({ color: PixiPremiumScene.color(cols.accent), alpha: 0.92 });
          } else {
            const progress = Math.min(1, (save.storyLevel || 1) / 10);
            sigil.circle(w / 2, 138, 34).stroke({ color: PixiPremiumScene.color(cols.text), alpha: 0.34, width: 8 });
            sigil.arc(w / 2, 138, 34, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress)
              .stroke({ color: PixiPremiumScene.color(cols.accent), alpha: 0.95, width: 8 });
            sigil.rect(w / 2 - 9, 127, 18, 22).fill({ color: PixiPremiumScene.color(cols.text), alpha: 0.9 });
          }
          card.addChild(sigil);

          if (isEmpty) {
            const newGame = PixiPremiumScene.text('New Game', { fontSize: 28, fontWeight: '800', fill: cols.text });
            newGame.anchor.set(0.5);
            newGame.x = w / 2;
            newGame.y = 214;
            card.addChild(newGame);

            const hint = PixiPremiumScene.text('Start a fresh climb', { fontSize: 17, fill: PixiPremiumScene.alpha(cols.text, '99') });
            hint.anchor.set(0.5);
            hint.x = w / 2;
            hint.y = 252;
            card.addChild(hint);
            return;
          }

          const tier = DifficultyScaler.getTierLabel(save.difficultyTier);
          const tierText = PixiPremiumScene.text(tier, { fontSize: 26, fontWeight: '800', fill: cols.text });
          tierText.anchor.set(0.5);
          tierText.x = w / 2;
          tierText.y = 200;
          PixiPremiumScene.fit(tierText, w - 56);
          card.addChild(tierText);

          const elo = PixiPremiumScene.text(DifficultyScaler.getTierElo(save.difficultyTier), { fontSize: 16, fill: PixiPremiumScene.alpha(cols.text, '88') });
          elo.anchor.set(0.5);
          elo.x = w / 2;
          elo.y = 232;
          card.addChild(elo);

          this.progress(card, 42, 286, w - 84, 16, Math.min(1, (save.storyLevel || 1) / 10), cols);
          const level = PixiPremiumScene.text(`Level ${save.storyLevel || 1} / 10`, { fontSize: 18, fontWeight: '700', fill: cols.text });
          level.anchor.set(0.5);
          level.x = w / 2;
          level.y = 270;
          card.addChild(level);

          const status = PixiPremiumScene.text(save.completed ? 'Completed' : 'Click to continue', {
            fontSize: 16,
            fill: save.completed ? '#7dea99' : PixiPremiumScene.alpha(cols.text, '88'),
          });
          status.anchor.set(0.5);
          status.x = w / 2;
          status.y = 332;
          card.addChild(status);
        },
      });
    });
  },

  buildDifficulty() {
    const tiers = ['rookie', 'beginner', 'intermediate', 'advanced', 'expert'];
    if (store.get('madnessUnlocked')) tiers.push('madness');

    const intro = PixiPremiumScene.text('Each tier keeps the same story, but changes the AI curve across all ten opponents.', {
      fontSize: 19,
      fill: PixiPremiumScene.alpha(ThemeManager.getCurrentColors().text, 'bb'),
    });
    intro.anchor.set(0.5);
    intro.x = 640;
    intro.y = 146;
    PixiPremiumScene.fit(intro, 900);
    this.pixiContainer.addChild(intro);

    const startY = 190;
    tiers.forEach((tier, i) => {
      const config = DifficultyScaler.TIER_CONFIG[tier];
      PixiPremiumScene.card(this.pixiContainer, 310, startY + i * 76, 660, 60, {
        activeColor: tier === 'madness' ? '#ff4868' : ThemeManager.getCurrentColors().accent,
        onClick: () => this.chooseDifficulty(tier),
        draw: (card) => {
          const cols = ThemeManager.getCurrentColors();
          const label = PixiPremiumScene.text(config.label, {
            fontSize: 23,
            fontWeight: '800',
            fill: tier === 'madness' ? '#ff8aa0' : cols.text,
          });
          label.x = 28;
          label.y = 17;
          PixiPremiumScene.fit(label, 280);
          card.addChild(label);

          const desc = PixiPremiumScene.text(config.desc, { fontSize: 15, fill: PixiPremiumScene.alpha(cols.text, '88') });
          desc.x = 300;
          desc.y = 12;
          PixiPremiumScene.fit(desc, 250);
          card.addChild(desc);

          const elo = PixiPremiumScene.text(config.elo, { fontSize: 18, fontWeight: '800', fill: cols.accent });
          elo.anchor.set(1, 0.5);
          elo.x = 628;
          elo.y = 32;
          card.addChild(elo);
        },
      });
    });
  },

  buildCharacters() {
    const save = store.getActiveSave() || {};
    const maxUnlocked = save.maxUnlockedLevel || 1;
    const storyLevel = save.storyLevel || 1;
    if (!this.selectedChar) {
      this.selectedChar = this.characters.find(ch => ch.level === storyLevel && ch.level <= maxUnlocked) || this.characters.find(ch => ch.level <= maxUnlocked);
    }

    PixiPremiumScene.panel(this.pixiContainer, 72, 132, 492, 560, { accentAlpha: 0.42 });
    const listTitle = PixiPremiumScene.text(`Story ${storyLevel} / 10`, { fontSize: 19, fontWeight: '800', fill: ThemeManager.getCurrentColors().text });
    listTitle.x = 100;
    listTitle.y = 154;
    this.pixiContainer.addChild(listTitle);

    const cardW = 216;
    const cardGap = 18;
    const cardStartX = 92;
    this.characters.forEach((ch, i) => {
      const row = i % 5;
      const col = Math.floor(i / 5);
      const x = cardStartX + col * (cardW + cardGap);
      const y = 196 + row * 92;
      const unlocked = ch.level <= maxUnlocked;
      PixiPremiumScene.card(this.pixiContainer, x, y, cardW, 74, {
        active: this.selectedChar && this.selectedChar.id === ch.id,
        disabled: !unlocked,
        activeColor: ch.colors.primary,
        onClick: () => {
          if (!unlocked) return;
          this.selectedChar = ch;
          this.build();
        },
        draw: (card) => {
          const cols = ThemeManager.getCurrentColors();
          const thumb = new PIXI.Sprite(unlocked ? PixiPremiumAssets.character(ch.id) : PixiPremiumAssets.icon('lock'));
          thumb.width = 52;
          thumb.height = 52;
          thumb.x = 12;
          thumb.y = 11;
          thumb.alpha = unlocked ? 1 : 0.75;
          card.addChild(thumb);

          const name = PixiPremiumScene.text(unlocked ? ch.name : `Level ${ch.level} Locked`, { fontSize: 18, fontWeight: '800', fill: unlocked ? cols.text : PixiPremiumScene.alpha(cols.text, '77') });
          name.x = 76;
          name.y = 16;
          PixiPremiumScene.fit(name, cardW - 92);
          card.addChild(name);

          const title = PixiPremiumScene.text(unlocked ? ch.title : `Beat level ${ch.level - 1}`, { fontSize: 12.5, fill: unlocked ? ch.colors.primary : PixiPremiumScene.alpha(cols.text, '55') });
          title.x = 76;
          title.y = 42;
          PixiPremiumScene.fit(title, cardW - 94, 0.62);
          card.addChild(title);
        },
      });
    });

    this.buildCharacterDetail();
    PixiPremiumScene.button(this.pixiContainer, 1084, 718, 160, 44, 'Themes', () => switchScreen('themeSelect', { returnTo: 'characterSelect' }), { icon: 'spark' });
  },

  buildCharacterDetail() {
    const ch = this.selectedChar;
    if (!ch) return;
    const cols = ThemeManager.getCurrentColors();
    PixiPremiumScene.panel(this.pixiContainer, 604, 132, 604, 560, { accent: ch.colors.primary, accentAlpha: 0.9 });

    const portrait = new PIXI.Sprite(PixiPremiumAssets.characterCard(ch.id));
    portrait.width = 238;
    portrait.height = 292;
    portrait.x = 640;
    portrait.y = 170;
    this.pixiContainer.addChild(portrait);

    const name = PixiPremiumScene.text(ch.name, { fontSize: 34, fontWeight: '900', fill: cols.text });
    name.x = 914;
    name.y = 174;
    PixiPremiumScene.fit(name, 250);
    this.pixiContainer.addChild(name);

    const title = PixiPremiumScene.text(ch.title, { fontSize: 20, fontWeight: '800', fill: ch.colors.primary });
    title.x = 916;
    title.y = 218;
    PixiPremiumScene.fit(title, 250);
    this.pixiContainer.addChild(title);

    const meta = PixiPremiumScene.text(`Level ${ch.level}  |  ${DifficultyScaler.getTierLabel((store.getActiveSave() || {}).difficultyTier)}`, {
      fontSize: 16,
      fill: PixiPremiumScene.alpha(cols.text, 'aa'),
    });
    meta.x = 916;
    meta.y = 252;
    PixiPremiumScene.fit(meta, 250);
    this.pixiContainer.addChild(meta);

    const quotePanel = new PIXI.Container();
    this.pixiContainer.addChild(quotePanel);
    const quoteX = 904;
    const quoteY = 286;
    const quoteW = 276;
    const quoteH = 190;
    PixiPremiumScene.panel(quotePanel, quoteX, quoteY, quoteW, quoteH, { accent: ch.colors.primary, accentAlpha: 0.35, alpha: 0.52 });
    const quote = PixiPremiumScene.text(ch.dialogue.before, {
      fontSize: 16,
      fill: PixiPremiumScene.alpha(cols.text, 'dd'),
      wordWrap: true,
      wordWrapWidth: quoteW - 32,
      lineHeight: 19,
    });
    this.fitWrappedText(quote, quoteH - 42, 11);
    quote.x = quoteX + 16;
    quote.y = quoteY + 24;
    quotePanel.addChild(quote);

    const beat = ch.level < ((store.getActiveSave() || {}).storyLevel || 1);
    const next = ch.level === ((store.getActiveSave() || {}).storyLevel || 1);
    const status = beat ? 'Defeated' : next ? 'Next Battle' : 'Unlocked';
    const statusText = PixiPremiumScene.text(status, { fontSize: 18, fontWeight: '800', fill: beat ? '#7dea99' : cols.accent });
    statusText.x = 640;
    statusText.y = 496;
    this.pixiContainer.addChild(statusText);

    PixiPremiumScene.button(this.pixiContainer, 640, 544, 250, 54, 'Fight', () => this.startFight(), { primary: true, icon: 'play' });
  },

  fitWrappedText(text, maxHeight, minFontSize) {
    let size = Number(text.style.fontSize) || 16;
    while (text.height > maxHeight && size > minFontSize) {
      size -= 1;
      text.style.fontSize = size;
      text.style.lineHeight = Math.max(size + 3, 14);
    }
  },

  progress(parent, x, y, w, h, value, cols) {
    const g = new PIXI.Graphics();
    g.roundRect(x, y, w, h, 5).fill({ color: 0x081624, alpha: 0.9 });
    g.roundRect(x, y, w, h, 5).stroke({ color: PixiPremiumScene.color(cols.text), alpha: 0.35, width: 2 });
    g.roundRect(x + 3, y + 3, Math.max(8, (w - 6) * value), h - 6, 3).fill({ color: PixiPremiumScene.color(cols.accent), alpha: 0.96 });
    parent.addChild(g);
  },

  chooseSlot(index) {
    this.selectedSlot = index;
    const save = store.get('storySaves')[index];
    if (!save.difficultyTier) {
      this.phase = 'difficulty';
    } else {
      store.setActiveSlot(index + 1);
      store.saveProgress();
      this.phase = 'characters';
    }
    this.build();
  },

  chooseDifficulty(tier) {
    store.setActiveSlot(this.selectedSlot + 1);
    store.setActiveSave({
      difficultyTier: tier,
      storyLevel: 1,
      maxUnlockedLevel: 1,
      selectedCharacter: null,
      completed: false,
    });
    store.saveProgress();
    this.phase = 'characters';
    this.selectedChar = this.characters[0];
    this.build();
  },

  startFight() {
    if (!this.selectedChar) return;
    store.setActiveSave({
      selectedCharacter: this.selectedChar.id,
      storyLevel: this.selectedChar.level,
    });
    store.update({
      selectedCharacter: this.selectedChar.id,
      storyLevel: this.selectedChar.level,
      mode: 'story',
    });
    store.saveProgress();
    switchScreen('game');
  },

  back() {
    if (this.phase === 'slots') {
      switchScreen('home');
      return;
    }
    if (this.phase === 'difficulty') {
      this.phase = 'slots';
      this.build();
      return;
    }
    switchScreen('home');
  },

  handleKeyDown(e) {
    if (e.key === 'Escape') this.back();
  },
};
