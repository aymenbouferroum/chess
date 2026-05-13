const ThemeSelect = {
  isPixiScreen: true,
  pixiContainer: null,
  themes: [],
  returnScreen: 'home',
  selectedThemeId: null,

  init(data) {
    this.themes = ThemeManager.getAllThemes();
    this.returnScreen = data?.returnTo || 'home';
    this.selectedThemeId = store.get('theme') || 'space';
    const settings = store.get('settings') || {};
    if (settings.bossThemeEnabled !== false) {
      this._buildLockedScreen();
      return;
    }
    this.build();
  },

  _buildLockedScreen() {
    if (this.pixiContainer) this.pixiContainer.destroy({ children: true });
    this.pixiContainer = PixiPremiumScene.root('Theme Select', 'Theme is controlled by boss world', {});
    PixiScreenManager.setScreenContainer(this.pixiContainer);

    const cols = ThemeManager.getCurrentColors();
    const panelW = Layout.isPortrait ? 620 : 500;
    const panelH = 300;
    const px = Layout.cx - panelW / 2;
    const py = Layout.cy - panelH / 2 - 20;
    PixiPremiumScene.panel(this.pixiContainer, px, py, panelW, panelH, { accentAlpha: 0.5 });

    const icon = new PIXI.Graphics();
    icon.rect(0, 4, 40, 32).fill({ color: PixiColorUtil.hexToNum(cols.accent), alpha: 0.25 });
    icon.rect(14, 0, 12, 8).fill({ color: PixiColorUtil.hexToNum(cols.accent), alpha: 0.6 });
    icon.x = Layout.cx - 20;
    icon.y = py + 28;
    this.pixiContainer.addChild(icon);

    const title = PixiPremiumScene.text('Boss World Theme Active', { fontSize: 24, fontWeight: '900', fill: cols.text });
    title.anchor.set(0.5, 0);
    title.x = Layout.cx;
    title.y = py + 72;
    this.pixiContainer.addChild(title);

    const desc = PixiPremiumScene.text('The theme changes automatically\nbased on the boss you fight.\n\nDisable "Boss World Theme" in Settings\nto pick themes manually.', { fontSize: 16, fill: PixiPremiumScene.alpha(cols.text, 'aa'), lineHeight: 24 });
    desc.anchor.set(0.5, 0);
    desc.x = Layout.cx;
    desc.y = py + 110;
    this.pixiContainer.addChild(desc);

    const btnY = Layout.H - 82;
    PixiPremiumScene.button(this.pixiContainer, 36, btnY, 160, 44, 'Back', () => switchScreen(this.returnScreen), { icon: 'back' });
    PixiPremiumScene.button(this.pixiContainer, Layout.cx - 80, py + panelH - 60, 160, 44, 'Settings', () => switchScreen('settings'), { primary: true });
  },

  destroy() {
    PixiPremiumScene.destroy(this);
  },

  pixiUpdate(dt) {
    PixiPremiumScene.update(this.pixiContainer, dt);
  },

  build() {
    if (this.pixiContainer) this.pixiContainer.destroy({ children: true });
    const subtitle = Layout.isPortrait ? 'Gallery above, custom editor below' : 'Gallery on the left, custom editor on the right';
    this.pixiContainer = PixiPremiumScene.root('Theme Select', subtitle, { footerHint: 'Locked themes unlock through story progress' });
    PixiScreenManager.setScreenContainer(this.pixiContainer);
    this.buildGallery();
    this.buildDrawer();
    const btnY = Layout.H - 82;
    PixiPremiumScene.button(this.pixiContainer, 36, btnY, 160, 44, 'Back', () => switchScreen(this.returnScreen), { icon: 'back' });
  },

  buildGallery() {
    const portrait = Layout.isPortrait;
    const galleryCols = portrait ? 2 : 3;
    const cardW = portrait ? Math.floor((Layout.W - 80 - 18) / 2) : 246;
    const cardH = 118;
    const lockedCardH = 72;
    const gap = 18;
    const lockedGap = 12;
    const startX = portrait ? 40 : 66;
    const startY = 134;
    const cols = ThemeManager.getCurrentColors();

    const unlockedThemes = this.themes.filter(t => ThemeManager.isThemeUnlocked(t.id));
    const lockedThemes = this.themes.filter(t => !ThemeManager.isThemeUnlocked(t.id));

    unlockedThemes.forEach((theme, i) => {
      const row = Math.floor(i / galleryCols);
      const col = i % galleryCols;
      const x = startX + col * (cardW + gap);
      const y = startY + row * (cardH + gap);
      const active = store.get('theme') === theme.id;
      const selected = this.selectedThemeId === theme.id;
      PixiPremiumScene.card(this.pixiContainer, x, y, cardW, cardH, {
        active: active || selected,
        activeColor: theme.colors.accent,
        onClick: () => this.selectTheme(theme.id, true),
        draw: (card) => {
          const preview = new PIXI.Sprite(PixiPremiumAssets.theme(theme.id));
          preview.width = cardW - 18;
          preview.height = cardH - 18;
          preview.x = 9;
          preview.y = 9;
          preview.alpha = 0.86;
          card.addChild(preview);

          const shade = new PIXI.Graphics().roundRect(9, 62, cardW - 18, 47, 6).fill({ color: 0x020812, alpha: 0.68 });
          card.addChild(shade);

          const name = PixiPremiumScene.text(theme.name, {
            fontSize: 18,
            fontWeight: '900',
            fill: theme.colors.text,
          });
          name.x = 20;
          name.y = 68;
          PixiPremiumScene.fit(name, active ? 150 : 190, 0.56);
          card.addChild(name);

          const desc = PixiPremiumScene.text(theme.desc, {
            fontSize: 13,
            fill: PixiColorUtil.alpha(theme.colors.text, 'aa'),
          });
          desc.x = 20;
          desc.y = 92;
          PixiPremiumScene.fit(desc, 196, 0.5);
          card.addChild(desc);

          if (active) {
            const badge = new PIXI.Graphics()
              .roundRect(cardW - 78, 65, 62, 22, 4)
              .fill({ color: PixiColorUtil.hexToNum(theme.colors.accent), alpha: 0.88 });
            card.addChild(badge);
            const tag = PixiPremiumScene.text('ACTIVE', { fontSize: 12, fontWeight: '900', fill: '#000000' });
            tag.anchor.set(0.5);
            tag.x = cardW - 47;
            tag.y = 76;
            card.addChild(tag);

            const check = new PIXI.Graphics()
              .moveTo(cardW - 24, 14)
              .lineTo(cardW - 18, 22)
              .lineTo(cardW - 8, 8)
              .stroke({ color: PixiColorUtil.hexToNum(theme.colors.accent), width: 3, alpha: 0.9 });
            card.addChild(check);
          }
        },
      });
    });

    const unlockedRows = Math.ceil(unlockedThemes.length / galleryCols);
    const separatorY = startY + unlockedRows * (cardH + gap) + 2;

    if (lockedThemes.length > 0) {
      const sepW = portrait ? (Layout.W - 80) : (galleryCols * (cardW + gap) - gap);
      const sepLine = new PIXI.Graphics()
        .rect(startX, separatorY, sepW, 1)
        .fill({ color: PixiColorUtil.hexToNum(cols.text), alpha: 0.12 });
      this.pixiContainer.addChild(sepLine);

      const sepLabel = PixiPremiumScene.text('LOCKED', {
        fontSize: 11,
        fontWeight: '900',
        fill: PixiPremiumScene.alpha(cols.text, '55'),
        letterSpacing: 2,
      });
      sepLabel.anchor.set(0.5);
      sepLabel.x = startX + sepW / 2;
      sepLabel.y = separatorY;
      const labelBg = new PIXI.Graphics()
        .rect(sepLabel.x - 36, separatorY - 8, 72, 16)
        .fill({ color: 0x030711, alpha: 0.7 });
      this.pixiContainer.addChild(labelBg);
      this.pixiContainer.addChild(sepLabel);
    }

    const lockedStartY = separatorY + 18;
    lockedThemes.forEach((theme, i) => {
      const row = Math.floor(i / galleryCols);
      const col = i % galleryCols;
      const x = startX + col * (cardW + lockedGap);
      const y = lockedStartY + row * (lockedCardH + lockedGap);
      const lockedSelected = this.selectedThemeId === theme.id;
      PixiPremiumScene.card(this.pixiContainer, x, y, cardW, lockedCardH, {
        active: lockedSelected,
        activeColor: theme.colors.accent,
        alpha: 0.43,
        onClick: () => this.selectTheme(theme.id, false),
        draw: (card) => {
          card.alpha = 0.45;

          const preview = new PIXI.Sprite(PixiPremiumAssets.theme(theme.id));
          preview.width = cardW - 18;
          preview.height = lockedCardH - 18;
          preview.x = 9;
          preview.y = 9;
          preview.alpha = 0.3;
          card.addChild(preview);

          const shade = new PIXI.Graphics().roundRect(9, 28, cardW - 18, 35, 4).fill({ color: 0x020812, alpha: 0.72 });
          card.addChild(shade);

          const lock = new PIXI.Sprite(PixiPremiumAssets.icon('lock'));
          lock.width = 20;
          lock.height = 20;
          lock.x = 14;
          lock.y = 32;
          card.addChild(lock);

          const name = PixiPremiumScene.text(theme.name, {
            fontSize: 15,
            fontWeight: '900',
            fill: PixiPremiumScene.alpha(cols.text, 'aa'),
          });
          name.x = 40;
          name.y = 32;
          PixiPremiumScene.fit(name, cardW - 70, 0.56);
          card.addChild(name);

          const hint = PixiPremiumScene.text(this.unlockLabel(theme.id), {
            fontSize: 11,
            fill: PixiPremiumScene.alpha(cols.text, '66'),
          });
          hint.x = 40;
          hint.y = 50;
          PixiPremiumScene.fit(hint, cardW - 70, 0.5);
          card.addChild(hint);
        },
      });
    });
  },

  buildDrawer() {
    const cols = ThemeManager.getCurrentColors();
    const theme = ThemeManager.getTheme(this.selectedThemeId || store.get('theme'));
    const unlocked = ThemeManager.isThemeUnlocked(theme.id);
    const portrait = Layout.isPortrait;

    const galleryCols = portrait ? 2 : 3;
    const galleryRows = Math.ceil(this.themes.length / galleryCols);
    const drawerX = portrait ? Math.floor((Layout.W - 720) / 2) : 854;
    const drawerY = portrait ? (134 + galleryRows * (118 + 18) + 10) : 120;
    const drawerW = portrait ? 720 : 370;
    const drawerH = portrait ? 520 : 600;
    PixiPremiumScene.panel(this.pixiContainer, drawerX, drawerY, drawerW, drawerH, { accent: theme.colors.accent, accentAlpha: 0.72 });

    const innerX = drawerX + 24;
    const previewW = portrait ? 320 : 322;
    const previewH = portrait ? 180 : 190;
    const preview = new PIXI.Sprite(PixiPremiumAssets.theme(theme.id));
    preview.width = previewW;
    preview.height = previewH;
    preview.x = innerX;
    preview.y = drawerY + 32;
    this.pixiContainer.addChild(preview);

    const previewBorder = new PIXI.Graphics()
      .roundRect(innerX - 2, drawerY + 30, previewW + 4, previewH + 4, 6)
      .stroke({ color: PixiColorUtil.hexToNum(theme.colors.accent), alpha: 0.4, width: 2 });
    this.pixiContainer.addChild(previewBorder);

    const infoX = portrait ? (innerX + previewW + 24) : innerX;
    const infoY = portrait ? (drawerY + 32) : (drawerY + 238);
    const infoMaxW = portrait ? (drawerW - previewW - 72) : 320;
    const title = PixiPremiumScene.text(theme.name, { fontSize: 30, fontWeight: '900', fill: cols.text });
    title.x = infoX;
    title.y = infoY;
    PixiPremiumScene.fit(title, infoMaxW);
    this.pixiContainer.addChild(title);
    const desc = PixiPremiumScene.text(theme.desc, { fontSize: 16, fill: PixiPremiumScene.alpha(cols.text, 'aa') });
    desc.x = infoX;
    desc.y = infoY + 38;
    PixiPremiumScene.fit(desc, infoMaxW);
    this.pixiContainer.addChild(desc);

    const boardY = portrait ? (infoY + 66) : (infoY + 66);
    const sqSize = 32;
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 3; c++) {
        const isLight = (r + c) % 2 === 0;
        const sqColor = isLight ? theme.colors.lightSquare : theme.colors.darkSquare;
        const sq = new PIXI.Graphics()
          .rect(infoX + c * sqSize, boardY + r * sqSize, sqSize, sqSize)
          .fill(PixiColorUtil.hexToNum(sqColor));
        this.pixiContainer.addChild(sq);
      }
    }
    const boardBorder = new PIXI.Graphics()
      .rect(infoX - 1, boardY - 1, 3 * sqSize + 2, 2 * sqSize + 2)
      .stroke({ color: PixiColorUtil.hexToNum(cols.text), alpha: 0.2, width: 1 });
    this.pixiContainer.addChild(boardBorder);

    const boardLabel = PixiPremiumScene.text('Board', { fontSize: 11, fill: PixiPremiumScene.alpha(cols.text, '77') });
    boardLabel.x = infoX + 3 * sqSize + 8;
    boardLabel.y = boardY + 8;
    this.pixiContainer.addChild(boardLabel);

    const btnY = portrait ? (boardY + 2 * sqSize + 16) : (boardY + 2 * sqSize + 16);
    const btnW = portrait ? Math.min(infoMaxW, 322) : 322;
    if (theme.id !== 'custom') {
      const isActive = store.get('theme') === theme.id;
      const btnLabel = !unlocked ? 'Locked' : (isActive ? 'Applied' : 'Apply Theme');
      PixiPremiumScene.button(this.pixiContainer, infoX, btnY, btnW, 46, btnLabel, () => {
        if (unlocked) this.selectTheme(theme.id, true);
      }, { primary: unlocked && !isActive, icon: unlocked ? 'spark' : 'lock', disabled: !unlocked });

      if (!unlocked) {
        const lockHint = PixiPremiumScene.text(this.unlockLabel(theme.id), { fontSize: 13, fill: PixiPremiumScene.alpha(cols.text, '77') });
        lockHint.x = infoX;
        lockHint.y = btnY + 54;
        this.pixiContainer.addChild(lockHint);
      }

      this.palettePreview(theme, infoX, btnY + (unlocked ? 64 : 78));
      return;
    }

    this.customEditor(innerX, drawerY + 284);
  },

  palettePreview(theme, x, y) {
    const cols = ThemeManager.getCurrentColors();
    const colors = ['lightSquare', 'darkSquare', 'lightPiece', 'darkPiece', 'accent', 'background'];
    const labels = ['Light Sq', 'Dark Sq', 'Light Pc', 'Dark Pc', 'Accent', 'Bg'];
    const chipSize = 44;
    const chipGap = 54;
    colors.forEach((key, i) => {
      const cx = x + (i % 3) * chipGap;
      const cy = y + Math.floor(i / 3) * (chipSize + 22);
      const chip = new PIXI.Graphics()
        .roundRect(cx, cy, chipSize, chipSize, 6)
        .fill(PixiPremiumScene.color(theme.colors[key]))
        .roundRect(cx, cy, chipSize, chipSize, 6)
        .stroke({ color: 0xffffff, alpha: 0.25, width: 2 });
      this.pixiContainer.addChild(chip);
      const label = PixiPremiumScene.text(labels[i], { fontSize: 10, fill: PixiPremiumScene.alpha(cols.text, '77') });
      label.anchor.set(0.5, 0);
      label.x = cx + chipSize / 2;
      label.y = cy + chipSize + 3;
      this.pixiContainer.addChild(label);
    });
  },

  customEditor(x, y) {
    const cols = ThemeManager.getCurrentColors();
    const custom = ThemeManager.getTheme('custom');
    const colorKeys = ['lightSquare', 'darkSquare', 'lightPiece', 'darkPiece', 'highlight', 'background', 'panel', 'text', 'accent', 'buttonBg'];
    const presets = ['#ff6578', '#7dea99', '#6aa7ff', '#ffe17a', '#d24dff', '#4dd7d0', '#ffffff', '#101423', '#8b9dc3', '#ff9a4d', '#905cff', '#21a9ff', '#7a4b2a', '#2e8b57', '#59172a'];

    const heading = PixiPremiumScene.text('Custom Palette', { fontSize: 18, fontWeight: '900', fill: cols.text });
    heading.x = x;
    heading.y = y;
    this.pixiContainer.addChild(heading);

    colorKeys.forEach((key, i) => {
      const sx = x + (i % 5) * 54;
      const sy = y + 38 + Math.floor(i / 5) * 66;
      const group = new PIXI.Container();
      group.x = sx;
      group.y = sy;
      group.eventMode = 'static';
      group.cursor = 'pointer';
      group.hitArea = new PIXI.Rectangle(0, 0, 42, 56);
      group.on('pointerdown', () => {
        if (typeof audioManager !== 'undefined' && typeof audioManager.playButton === 'function') {
          audioManager.playButton();
        }
        const current = custom.colors[key];
        const index = Math.max(0, presets.indexOf(current));
        ThemeManager.setCustomColor(key, presets[(index + 1) % presets.length]);
        ThemeManager.applyTheme('custom');
        this.selectedThemeId = 'custom';
        this.build();
      });
      const chip = new PIXI.Graphics()
        .roundRect(0, 0, 38, 38, 6)
        .fill(PixiPremiumScene.color(custom.colors[key]))
        .roundRect(0, 0, 38, 38, 6)
        .stroke({ color: PixiPremiumScene.color(cols.text), alpha: 0.35, width: 2 });
      group.addChild(chip);
      const label = PixiPremiumScene.text(key.replace('Square', ''), { fontSize: 10, fill: PixiPremiumScene.alpha(cols.text, '99') });
      label.anchor.set(0.5, 0);
      label.x = 19;
      label.y = 43;
      PixiPremiumScene.fit(label, 52, 0.48);
      group.addChild(label);
      this.pixiContainer.addChild(group);
    });

    this.themeChips('Music', store.get('customMusicTheme') || 'space', x, y + 190, (id) => {
      store.set('customMusicTheme', id);
      store.saveProgress();
      if (typeof audioManager !== 'undefined') {
        audioManager.stopMusic();
        audioManager.startMusic();
        if (typeof audioManager.playThemeStinger === 'function') {
          audioManager.playThemeStinger(id);
        }
      }
      this.build();
    });
    this.themeChips('Backdrop', store.get('customBgTheme') || 'space', x, y + 266, (id) => {
      store.set('customBgTheme', id);
      store.saveProgress();
      this.build();
    });

    PixiPremiumScene.button(this.pixiContainer, x, y + 190, 282, 42, store.get('theme') === 'custom' ? 'Custom Applied' : 'Apply Custom', () => this.selectTheme('custom', true), { primary: true });
  },

  themeChips(label, current, x, y, onPick) {
    const cols = ThemeManager.getCurrentColors();
    const t = PixiPremiumScene.text(label, { fontSize: 15, fontWeight: '900', fill: cols.text });
    t.x = x;
    t.y = y;
    this.pixiContainer.addChild(t);
    const baseThemes = this.themes.filter(theme => theme.id !== 'custom').slice(0, 10);
    baseThemes.forEach((theme, i) => {
      const chip = PixiPremiumScene.button(this.pixiContainer, x + (i % 5) * 56, y + 28 + Math.floor(i / 5) * 30, 48, 22, theme.name.split(' ')[0], () => onPick(theme.id), {
        primary: theme.id === current,
        fontSize: 10,
        color: theme.colors.accent,
      });
      chip.scale.set(1);
    });
  },

  selectTheme(id, unlocked) {
    this.selectedThemeId = id;
    if (unlocked) {
      ThemeManager.applyTheme(id);
    }
    this.build();
  },

  unlockLabel(id) {
    const reqs = {
      egypt: { lv: 2, hint: 'Beat Pawnie' },
      cyberpunk: { lv: 4, hint: 'Beat Rook-E' },
      japanese: { lv: 5, hint: 'Beat KnightShade' },
      artdeco: { lv: 6, hint: 'Beat Queenie' },
      wildwest: { lv: 7, hint: 'Beat CastlE' },
      prehistoric: { lv: 8, hint: 'Beat EndGamer' },
      steampunk: { lv: 9, hint: 'Beat ForkMaster' },
    };
    const req = reqs[id];
    return req ? `Lv ${req.lv} — ${req.hint}` : 'Story locked';
  },

  handleKeyDown(e) {
    if (e.key === 'Escape') switchScreen(this.returnScreen);
  },
};
