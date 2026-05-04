class ThemeManager {
  static getTheme(id) {
    const t = THEMES.find(t => t.id === id) || THEMES[0];
    if (id === 'custom') {
      const custom = store.get('customThemeColors') || {};
      return { ...t, colors: { ...t.colors, ...custom } };
    }
    return t;
  }

  static getAllThemes() {
    return THEMES;
  }

  static setCustomColor(key, value) {
    const custom = store.get('customThemeColors') || {};
    custom[key] = value;
    store.set('customThemeColors', custom);
    store.saveProgress();
  }

  static applyTheme(id) {
    const theme = this.getTheme(id);
    store.set('theme', id);
    PieceRenderer.clearCache();
    TextureManager.preloadTheme(theme.id);
    if (typeof audioManager !== 'undefined') {
      audioManager.stopMusic();
      audioManager.startMusic();
    }
    store.saveProgress();
    return theme;
  }
}
