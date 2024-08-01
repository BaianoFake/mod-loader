const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');

const store = new Store();
let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('index.html');

    // Evento quando a janela é fechada
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.on('navigate-to', (event, arg) => {
    mainWindow.loadFile(path.join(__dirname, `views/${arg}.html`));
});

ipcMain.handle('select-mod-folder', async (event, game) => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    });
    if (result.canceled) return null;
    const folderPath = result.filePaths[0];
    store.set(`modFolder.${game}`, folderPath);
    return folderPath;
});

ipcMain.handle('get-mod-folder', (event, game) => {
    return store.get(`modFolder.${game}`, '');
});

ipcMain.handle('select-mod-file', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [{ name: 'JAR Files', extensions: ['jar'] }]
    });
    if (result.canceled) return null;
    return result.filePaths[0];
});

ipcMain.handle('move-mod', async (event, source, destination) => {
    try {
        fs.renameSync(source, destination);
        return true;
    } catch (error) {
        console.error('Failed to move mod:', error);
        return false;
    }
});
