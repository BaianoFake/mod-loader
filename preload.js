const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

contextBridge.exposeInMainWorld('api', {
    openGameWindow: (game) => ipcRenderer.send('open-game-window', game),
    selectModFolder: () => ipcRenderer.invoke('select-mod-folder'),
    selectModFile: () => ipcRenderer.invoke('select-mod-file'),
    saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
    moveMod: (modPath, destPath) => ipcRenderer.invoke('move-mod', modPath, destPath),
    setGame: (game) => ipcRenderer.send('set-game', game),
    addProfile: (profileName) => ipcRenderer.send('add-profile', profileName),
    loadProfile: (profileName) => ipcRenderer.send('load-profile', profileName),
    receiveProfiles: (callback) => ipcRenderer.on('receive-profiles', (event, profiles) => callback(profiles)),
    loadSettings: () => ipcRenderer.send('load-settings'),
    receiveSettings: (callback) => ipcRenderer.on('load-settings', (event, settings) => callback(settings)),
    onUpdateAvailable: (callback) => ipcRenderer.on('update-available', (event, info) => callback(info)),
    onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', (event, info) => callback(info)),
    startDownload: () => ipcRenderer.send('start-download'),
    quitAndInstall: () => ipcRenderer.send('quit-and-install'),
    path: path,  // Expondo o módulo path
    fs: fs  // Expondo o módulo fs
});
