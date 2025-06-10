const { app, BrowserWindow } = require('electron');
const path = require('path');
const server = require('./server'); // 引入後端的 server.js

let mainWindow;

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});


function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // 允許渲染進程中使用 Node.js 模組
    },
  });

  // 載入 public 資料夾中的 index.html
  mainWindow.loadFile(path.join(__dirname, 'public', 'index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 啟動後端伺服器
app.whenReady().then(() => {
  createWindow();
  server.startServer();
});

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

mainWindow.webContents.openDevTools();
