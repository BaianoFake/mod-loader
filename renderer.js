const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

let modFolder;
let disabledModFolder;
let settings = { lastModFolder: '', history: [], profiles: {}, paths: { minecraft: '', zzz: '', genshin: '' } };
let currentGame = 'minecraft';

document.getElementById('chooseFolder').addEventListener('click', async () => {
    modFolder = await ipcRenderer.invoke('select-mod-folder');
    if (modFolder) {
        setModFolder(modFolder);
        updateGamePath(modFolder);
    }
});

document.getElementById('changeProfile').addEventListener('click', () => {
    document.getElementById('profileDropdown').classList.toggle('show');
});

document.getElementById('nameProfile').addEventListener('click', () => {
    const profileName = prompt('Digite o nome do perfil:');
    if (profileName) {
        settings.profiles[profileName] = { mods: getSelectedMods(), game: currentGame };
        document.getElementById('pageTitle').textContent = profileName;
        updateSettings();
    }
});

document.getElementById('installMod').addEventListener('click', async () => {
    let modPath;
    if (currentGame === 'minecraft') {
        modPath = await ipcRenderer.invoke('select-mod-file');
    } else {
        modPath = await ipcRenderer.invoke('select-mod-folder');
    }

    if (modPath) {
        const destPath = path.join(modFolder, path.basename(modPath));
        ipcRenderer.invoke('move-mod', modPath, destPath).then(success => {
            if (!success) alert('Falha ao instalar o mod');
            else loadMods();
        });
    }
});

ipcRenderer.on('load-settings', (event, loadedSettings) => {
    settings = loadedSettings;
    loadGamePaths();
    populateHistoryDropdown();
});

function setModFolder(folder) {
    modFolder = folder;
    disabledModFolder = path.join(path.dirname(modFolder), 'mods_desativados');
    loadMods();
    updateSettings(folder);
}

function loadMods() {
    const modList = document.getElementById(`${currentGame}ModList`);
    modList.innerHTML = '';

    const loadModFiles = (folder, isActive) => {
        fs.readdir(folder, (err, files) => {
            if (err) {
                console.error(err);
                return;
            }

            files.forEach(file => {
                const filePath = path.join(folder, file);
                if (fs.lstatSync(filePath).isDirectory() || file.endsWith('.jar') || file.endsWith('.zip')) {
                    addModToList(filePath, isActive);
                }
            });
        });
    };

    // Carregar mods ativos
    loadModFiles(modFolder, true);

    // Carregar mods desativados
    if (fs.existsSync(disabledModFolder)) {
        loadModFiles(disabledModFolder, false);
    }
}

function addModToList(filePath, isActive) {
    const modList = document.getElementById(`${currentGame}ModList`);
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

function updateSettings(folder = null) {
    if (folder) {
        settings.lastModFolder = folder;
        if (!settings.history.includes(folder)) {
            settings.history.unshift(folder);
            if (settings.history.length > 5) {
                settings.history.pop(); // Limitar o histórico a 5 entradas
            }
        }
    }
    ipcRenderer.invoke('save-settings', settings);
    populateHistoryDropdown();
}

function updateGamePath(folder) {
    settings.paths[currentGame] = folder;
    updateSettings();
}

function loadGamePaths() {
    if (settings.paths.minecraft) {
        setModFolder(settings.paths.minecraft);
    }
    if (settings.paths.zzz) {
        setModFolder(settings.paths.zzz);
    }
    if (settings.paths.genshin) {
        setModFolder(settings.paths.genshin);
    }
}

function populateHistoryDropdown() {
    const dropdown = document.getElementById('profileDropdown');
    dropdown.innerHTML = '';
    for (const profileName in settings.profiles) {
        const option = document.createElement('div');
        option.className = 'profile-option';
        option.textContent = profileName;
        option.addEventListener('click', () => applyProfile(profileName));
        dropdown.appendChild(option);
    }
}

function applyProfile(profileName) {
    const profile = settings.profiles[profileName];
    currentGame = profile.game;
    document.getElementById('pageTitle').textContent = profileName;
    loadModsFromProfile(profile);
}

function loadModsFromProfile(profile) {
    const modList = document.getElementById(`${profile.game}ModList`);
    modList.innerHTML = '';
    profile.mods.forEach(mod => {
        addModToList(mod.path, mod.active);
    });
}

function getSelectedMods() {
    const modList = document.getElementById(`${currentGame}ModList`);
    const mods = [];
    modList.querySelectorAll('li').forEach(li => {
        const checkbox = li.querySelector('input');
        const mod = {
            path: path.join(modFolder, li.textContent.trim()),
            active: checkbox.checked
        };
        mods.push(mod);
    });
    return mods;
}

function showSection(game) {
    document.querySelectorAll('.game-section').forEach(section => section.classList.add('hidden'));
    document.getElementById(game).classList.remove('hidden');
    currentGame = game;
    document.getElementById('pageTitle').textContent = `Gerenciador de Mods - ${game.charAt(0).toUpperCase() + game.slice(1)}`;
    setModFolder(settings.paths[game] || '');
}
