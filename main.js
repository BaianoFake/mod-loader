const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

let mainWindow;
const settingsPath = path.join(app.getPath('userData'), 'settings.json');
let settings = { profiles: {}, currentProfile: 'default' };

function saveSettings() {
    fs.writeFileSync(settingsPath, JSON.stringify(settings));
}

function loadSettings() {
    if (fs.existsSync(settingsPath)) {
        settings = JSON.parse(fs.readFileSync(settingsPath));
    }
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
        },
    });

    mainWindow.loadFile('index.html');

    mainWindow.maximize();

    mainWindow.on('ready-to-show', () => {
        mainWindow.show();
        mainWindow.webContents.send('receive-profiles', Object.keys(settings.profiles));
    });
}

app.whenReady().then(() => {
    loadSettings();
    createWindow();

    ipcMain.on('open-game-window', (event, game) => {
        mainWindow.loadFile(path.join('views', `${game}.html`));
    });

    ipcMain.on('add-profile', (event, profileName) => {
        settings.profiles[profileName] = {};
        saveSettings();
        mainWindow.webContents.send('receive-profiles', Object.keys(settings.profiles));
    });

    ipcMain.on('load-profile', (event, profileName) => {
        settings.currentProfile = profileName;
        saveSettings();
    });

    autoUpdater.checkForUpdates();

    autoUpdater.on('update-available', (info) => {
        mainWindow.webContents.send('update-available', info);
    });

    autoUpdater.on('update-downloaded', (info) => {
        mainWindow.webContents.send('update-downloaded', info);
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
        filters: [
            { name: 'Mods', extensions: ['jar', 'zip'] }
        ]
    });
    return result.filePaths[0];
});

ipcMain.handle('move-mod', async (event, modPath, destPath) => {
    try {
        fs.renameSync(modPath, destPath);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
});

ipcMain.handle('save-settings', (event, newSettings) => {
    settings = newSettings;
    saveSettings();
    return settings;
});

ipcMain.on('load-settings', (event) => {
    event.reply('load-settings', settings);
});

ipcMain.on('start-download', () => {
    autoUpdater.downloadUpdate();
});

ipcMain.on('quit-and-install', () => {
    autoUpdater.quitAndInstall();
});
