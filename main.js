const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
const settingsPath = path.join(app.getPath('userData'), 'settings.json');

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();
    mainWindow.webContents.on('did-finish-load', () => {
        if (fs.existsSync(settingsPath)) {
            const settings = JSON.parse(fs.readFileSync(settingsPath));
            mainWindow.webContents.send('load-settings', settings);
        }
    });
});

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

ipcMain.handle('select-mod-folder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    });
    return result.filePaths[0];
});

ipcMain.handle('save-settings', (event, settings) => {
    fs.writeFileSync(settingsPath, JSON.stringify(settings));
});

ipcMain.handle('move-mod', (event, modPath, destPath) => {
    try {
        fs.renameSync(modPath, destPath);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
});
