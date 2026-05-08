const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    useContentSize: true,
    resizable: true,
    fullscreenable: true,
    title: 'Chess 2.0',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, process.platform === 'win32' ? 'icon.ico' : 'icon.png'),
  });

  win.setMenu(null);
  win.loadFile(path.join(__dirname, 'src', 'index.html'));
  win.on('enter-full-screen', () => win.webContents.send('fullscreen-change', true));
  win.on('leave-full-screen', () => win.webContents.send('fullscreen-change', false));

  return win;
}

ipcMain.on('toggle-fullscreen', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    win.setFullScreen(!win.isFullScreen());
  }
});

ipcMain.on('save-screenshot', (event, { name, dataUrl }) => {
  const screenshotsDir = path.join(__dirname, 'assets', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
  const filePath = path.join(screenshotsDir, `${name}.png`);
  fs.writeFileSync(filePath, Buffer.from(base64, 'base64'));
  event.reply('screenshot-saved', { name, path: filePath });
});

// --- Dev screenshot system ---
// Create .screenshot-trigger file to capture the game window as dev-screenshot.png
let mainWin = null;

function setupDevScreenshot(win) {
  mainWin = win;
  const triggerPath = path.join(__dirname, '.screenshot-trigger');
  const outputPath = path.join(__dirname, 'dev-screenshot.png');

  setInterval(() => {
    if (fs.existsSync(triggerPath)) {
      try { fs.unlinkSync(triggerPath); } catch (_) {}
      if (mainWin && !mainWin.isDestroyed()) {
        mainWin.webContents.capturePage().then(image => {
          fs.writeFileSync(outputPath, image.toPNG());
        }).catch(() => {});
      }
    }
  }, 500);

  // Also capture on F5 key
  const { globalShortcut } = require('electron');
  globalShortcut.register('F5', () => {
    if (mainWin && !mainWin.isDestroyed()) {
      mainWin.webContents.capturePage().then(image => {
        fs.writeFileSync(outputPath, image.toPNG());
      }).catch(() => {});
    }
  });
}

app.whenReady().then(() => {
  const win = createWindow();
  setupDevScreenshot(win);

  // Auto-screenshot mode: create .screenshot-all-trigger to capture all screens
  const allTrigger = path.join(__dirname, '.screenshot-all-trigger');
  const screenshotsDir = path.join(__dirname, 'assets', 'screenshots');
  setInterval(() => {
    if (fs.existsSync(allTrigger)) {
      try { fs.unlinkSync(allTrigger); } catch (_) {}
      if (!win || win.isDestroyed()) return;
        const screens = [
          { name: 'home_screen', switch: null, delay: 2000 },
          { name: 'story_save', switch: "switchScreen('characterSelect')", delay: 1500 },
          { name: 'settings', switch: "switchScreen('settings')", delay: 1500 },
          { name: 'stats', switch: "switchScreen('stats')", delay: 1500 },
          { name: 'theme_select', switch: "switchScreen('themeSelect')", delay: 1500 },
          { name: 'bot_select', switch: "switchScreen('botSelect')", delay: 1500 },
          { name: 'custom_game', switch: "switchScreen('customGame')", delay: 1500 },
          { name: 'controls', switch: "switchScreen('controls')", delay: 1500 },
          { name: 'mini_game_practice', switch: "switchScreen('miniGamePractice')", delay: 1500 },
          { name: 'how_to_play', switch: "switchScreen('howToPlay')", delay: 1500 },
          { name: 'game_screen', switch: "store.set('mode','1v1'); store.set('miniGamesEnabled', false); switchScreen('game', { mode: '1v1' })", delay: 1800 },
          { name: 'home_screen_final', switch: "switchScreen('home')", delay: 1500 },
        ];
      (async () => {
        const waitForTransitionIdle = async () => {
          for (let i = 0; i < 60; i++) {
            const idle = await win.webContents.executeJavaScript("typeof transition === 'undefined' || !transition.active");
            if (idle) return;
            await new Promise(r => setTimeout(r, 100));
          }
        };
        for (const s of screens) {
          await waitForTransitionIdle();
          if (s.switch) {
            await win.webContents.executeJavaScript(s.switch);
            await waitForTransitionIdle();
          }
          await new Promise(r => setTimeout(r, s.delay));
          const img = await win.webContents.capturePage();
          if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });
          fs.writeFileSync(path.join(screenshotsDir, s.name + '.png'), img.toPNG());
        }
        fs.writeFileSync(path.join(__dirname, '.screenshots-done'), 'done');
      })();
    }
  }, 500);
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
