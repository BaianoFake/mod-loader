const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require("electron-updater");

let mainWindow;
const settingsPath = path.join(app.getPath('userData'), 'settings.json');

autoUpdater.autoDownload = false; // Para controle manual do download
autoUpdater.autoInstallOnAppQuit = true;

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

    // Verifica se há atualizações
    autoUpdater.checkForUpdates();

    // Notifica o usuário sobre atualizações
    autoUpdater.on('update-available', (info) => {
        mainWindow.webContents.send('update-available', info);
    });

    autoUpdater.on('update-downloaded', (info) => {
        mainWindow.webContents.send('update-downloaded', info);
    });

    // Adiciona listeners para o ipcMain para permitir controle de UI
    ipcMain.on('start-download', () => {
        autoUpdater.downloadUpdate();
    });

    ipcMain.on('quit-and-install', () => {
        autoUpdater.quitAndInstall();
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

ipcMain.handle('select-mod-file', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [{ name: 'Mods', extensions: ['jar', 'zip'] }]
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
