const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// ✅ Start the upload server
require('./server.js');

// ✅ Conditionally generate QR code
require('./generateQR').maybeGenerateQR();

function createWindow () {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    fullscreen: true,
    frame: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

ipcMain.on('quit-app', () => {
  app.quit();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});