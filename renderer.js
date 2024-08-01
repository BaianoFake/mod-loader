let modFolder;
let disabledModFolder;
let settings = { lastModFolder: '', history: [], profiles: {}, paths: { minecraft: '', zzz: '', genshin: '' } };
let currentGame = ''; // Defina o jogo atual como 'minecraft'

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar
    window.api.loadSettings();

    // Adicionar eventos para os botões de seleção de pasta e instalação de mod
    document.getElementById('chooseFolder').addEventListener('click', async () => {
        modFolder = await window.api.selectModFolder();
        if (modFolder) {
            setModFolder(modFolder);
            updateGamePath(modFolder);
        }
    });

    document.getElementById('installMod').addEventListener('click', async () => {
        let modPath = await window.api.selectModFile();
        if (modPath) {
            const destPath = window.api.path.join(modFolder, window.api.path.basename(modPath));
            const success = await window.api.moveMod(modPath, destPath);
            if (!success) alert('Falha ao instalar o mod');
            else loadMods();
        }
    });

    // Adicionar eventos para os botões de jogos
    document.getElementById('minecraftButton').addEventListener('click', () => {
        showGameSection('minecraft');
        currentGame = 'minecraft';
        loadGamePaths();
    });

    document.getElementById('zzzButton').addEventListener('click', () => {
        showGameSection('zzz');
        currentGame = 'zzz';
        loadGamePaths();
    });

    document.getElementById('genshinButton').addEventListener('click', () => {
        showGameSection('genshin');
        currentGame = 'genshin';
        loadGamePaths();
    });
});

function showGameSection(game) {
    document.querySelectorAll('.game-section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(`${game}Section`).classList.remove('hidden');
}

function setModFolder(folder) {
    modFolder = folder;
    disabledModFolder = window.api.path.join(window.api.path.dirname(modFolder), 'mods_desativados');
    loadMods();
    updateSettings(folder);
}

function loadMods() {
    const modList = document.getElementById(`${currentGame}ModList`);
    if (!modList) return; // Verifica se o elemento existe

    modList.innerHTML = '';

    const loadModFiles = (folder, isActive) => {
        window.api.fs.readdir(folder, (err, files) => {
            if (err) {
                console.error(err);
                return;
            }

            files.forEach(file => {
                const filePath = window.api.path.join(folder, file);
                const stats = window.api.fs.lstatSync(filePath);
                if (stats.isDirectory() || file.endsWith('.jar') || file.endsWith('.zip')) {
                    addModToList(filePath, isActive);
                }
            });
        });
    };

    loadModFiles(modFolder, true);
    if (window.api.fs.existsSync(disabledModFolder)) {
        loadModFiles(disabledModFolder, false);
    }
}

function addModToList(filePath, isActive) {
    const modList = document.getElementById(`${currentGame}ModList`);
    const modItem = document.createElement('li');
    modItem.innerHTML = `
        <input type="checkbox" class="checkbox" ${isActive ? 'checked' : ''} />
        <span>${window.api.path.basename(filePath)}</span>
    `;
    modItem.querySelector('.checkbox').addEventListener('change', function() {
        const newPath = isActive ? window.api.path.join(disabledModFolder, window.api.path.basename(filePath)) : window.api.path.join(modFolder, window.api.path.basename(filePath));
        window.api.moveMod(filePath, newPath).then(success => {
            if (!success) alert('Falha ao mover o mod');
            else loadMods();
        });
    });
    modList.appendChild(modItem);
}

function updateSettings(folder) {
    settings.lastModFolder = folder;
    window.api.saveSettings(settings);
}

function loadGamePaths() {
    if (settings.paths[currentGame]) {
        setModFolder(settings.paths[currentGame]);
    }
}

function updateGamePath(folder) {
    settings.paths[currentGame] = folder;
    window.api.saveSettings(settings);
}

// Atualizações
window.api.receiveSettings((loadedSettings) => {
    settings = loadedSettings;
    loadGamePaths();
});

window.api.onUpdateAvailable((info) => {
    const userDecision = confirm(`Atualização disponível (${info.version}). Deseja baixar agora?`);
    if (userDecision) {
        window.api.startDownload();
    }
});

window.api.onUpdateDownloaded((info) => {
    const userDecision = confirm(`Atualização para a versão ${info.version} foi baixada. Deseja instalar agora?`);
    if (userDecision) {
        window.api.quitAndInstall();
    }
});
