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
      contextIsolation: false, // 允许渲染进程中使用 Node.js 模块
    },
  });

  // 加载 public 文件夹中的 index.html
  mainWindow.loadFile(path.join(__dirname, 'public', 'index.html'));

  // 打开开发者工具调试
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 启动后端服务器
app.whenReady().then(() => {
  createWindow();
  server.startServer(); // 启动后端服务器
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
