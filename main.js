const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');
let mainWindow;
const configFilePath = path.join(app.getPath('userData'), 'config.json');

function readConfig() {
    if (fs.existsSync(configFilePath)) {
        const data = fs.readFileSync(configFilePath);
        return JSON.parse(data);
    }
    return {};
}

function saveConfig(config) {
    fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false
        },
        //autoHideMenuBar: true
    });

    mainWindow.loadFile('./views/index.html');

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    autoUpdater.checkForUpdatesAndNotify();
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

autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update_available');
});

autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update_downloaded');
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

    const config = readConfig();
    config.modFolders = config.modFolders || {};
    config.modFolders[game] = folderPath;
    saveConfig(config);

    return folderPath;
});

ipcMain.handle('get-mod-folder', (event, game) => {
    const config = readConfig();
    return config.modFolders ? config.modFolders[game] : '';
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
