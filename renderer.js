const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

let modFolder;
let disabledModFolder;
let settings = { lastModFolder: '', history: [] };

document.getElementById('chooseFolder').addEventListener('click', async () => {
    modFolder = await ipcRenderer.invoke('select-mod-folder');
    if (modFolder) {
        setModFolder(modFolder);
    }
});

document.getElementById('changeProfile').addEventListener('click', () => {
    document.getElementById('profileDropdown').classList.toggle('show');
});

ipcRenderer.on('load-settings', (event, loadedSettings) => {
    settings = loadedSettings;
    if (settings.lastModFolder) {
        setModFolder(settings.lastModFolder);
    }
    populateHistoryDropdown();
});

function setModFolder(folder) {
    modFolder = folder;
    disabledModFolder = path.join(path.dirname(modFolder), 'mods_desativados');
    document.getElementById('folderPath').textContent = `Pasta de Mods: ${modFolder}`;
    loadMods();
    updateSettings(folder);
}

function loadMods() {
    const modList = document.getElementById('modList');
    modList.innerHTML = '';

    // Carregar mods ativos
    fs.readdir(modFolder, (err, files) => {
        if (err) {
            console.error(err);
            return;
        }

        files.forEach(file => {
            const filePath = path.join(modFolder, file);
            if (fs.lstatSync(filePath).isDirectory() || file.endsWith('.java')) {
                addModToList(filePath, true);
            }
        });
    });

    // Carregar mods desativados
    if (fs.existsSync(disabledModFolder)) {
        fs.readdir(disabledModFolder, (err, files) => {
            if (err) {
                console.error(err);
                return;
            }

            files.forEach(file => {
                const filePath = path.join(disabledModFolder, file);
                if (fs.lstatSync(filePath).isDirectory() || file.endsWith('.jar')) {
                    addModToList(filePath, false);
                }
            });
        });
    }
}

function addModToList(filePath, isActive) {
    const modList = document.getElementById('modList');
    const li = document.createElement('li');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'checkbox';
    checkbox.checked = isActive;
    checkbox.addEventListener('change', () => toggleMod(filePath, checkbox.checked));

    li.appendChild(checkbox);
    li.appendChild(document.createTextNode(path.basename(filePath)));
    modList.appendChild(li);
}

function toggleMod(modPath, isActive) {
    if (isActive) {
        const destPath = path.join(modFolder, path.basename(modPath));
        ipcRenderer.invoke('move-mod', modPath, destPath).then(success => {
            if (!success) alert('Falha ao ativar o mod');
            else loadMods();
        });
    } else {
        if (!fs.existsSync(disabledModFolder)) {
            fs.mkdirSync(disabledModFolder);
        }
        const destPath = path.join(disabledModFolder, path.basename(modPath));
        ipcRenderer.invoke('move-mod', modPath, destPath).then(success => {
            if (!success) alert('Falha ao desativar o mod');
            else loadMods();
        });
    }
}

function updateSettings(folder) {
    settings.lastModFolder = folder;
    if (!settings.history.includes(folder)) {
        settings.history.unshift(folder);
        if (settings.history.length > 5) {
            settings.history.pop(); // Limitar o histórico a 5 entradas
        }
    }
    ipcRenderer.invoke('save-settings', settings);
    populateHistoryDropdown();
}

function populateHistoryDropdown() {
    const dropdown = document.getElementById('profileDropdown');
    dropdown.innerHTML = '';
    settings.history.forEach(folder => {
        const option = document.createElement('div');
        option.className = 'profile-option';
        option.textContent = folder;
        option.addEventListener('click', () => setModFolder(folder));
        dropdown.appendChild(option);
    });
}
