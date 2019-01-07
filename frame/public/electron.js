const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');
const isDev = require('electron-is-dev');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({width: 1920, height: 1280});
  mainWindow.loadURL(`file://${path.join(__dirname, '../output/webpack/production/index.html')}`);
  mainWindow.webContents.openDevTools();
  mainWindow.on('closed', () => mainWindow = null);
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// mainWindow.once('ready-to-show', () => {
//   mainWindow.show();
//   // Open the DevTools automatically if developing
//     mainWindow.webContents.openDevTools();
// });

