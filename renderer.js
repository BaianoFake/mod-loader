const ModLoader = require('./ModLoader');
const Profile = require('./Profile');
const Mod = require('./Mod');
const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
    const profileSelector = document.getElementById('profileSelector');
    const addProfileBtn = document.getElementById('addProfile');
    const minecraftBtn = document.getElementById('minecraft');
    const zzzBtn = document.getElementById('zzz');
    const genshinBtn = document.getElementById('genshin');
    const homeBtn = document.getElementById('home')

    const modLoader = new ModLoader();

    addProfileBtn.addEventListener('click', () => {
        const profileName = prompt('Nome do perfil:');
        const modFolderPath = prompt('Caminho da pasta de mods:');
        if (profileName && modFolderPath) {
            const profile = new Profile(profileName, modFolderPath);
            modLoader.addProfile(profile);
            updateProfileSelector();
        }
    });

    function updateProfileSelector() {
        profileSelector.innerHTML = '';
        modLoader.profiles.forEach(profile => {
            const option = document.createElement('option');
            option.text = profile.name;
            profileSelector.add(option);
        });
    }

    profileSelector.addEventListener('change', () => {
        const profileName = profileSelector.value;
        modLoader.switchProfile(profileName);
    });

    minecraftBtn.addEventListener('click', () => {
        ipcRenderer.send('navigate-to', 'minecraft');
    });

    zzzBtn.addEventListener('click', () => {
        ipcRenderer.send('navigate-to', 'zzz');
    });

    genshinBtn.addEventListener('click', () => {
        ipcRenderer.send('navigate-to', 'genshin');
    });

    homeBtn.addEventListener('click', () => {
        ipcRenderer.send('navigate-to', 'index');
    });

    ipcRenderer.on('update_available', () => {
        const notification = document.createElement('div');
        notification.innerText = 'Uma nova atualização está disponível. Baixando agora...';
        document.body.appendChild(notification);
    });

    ipcRenderer.on('update_downloaded', () => {
        const notification = document.createElement('div');
        notification.innerText = 'Atualização baixada. O aplicativo será reiniciado para aplicar a atualização.';
        const restartButton = document.createElement('button');
        restartButton.innerText = 'Reiniciar Agora';
        restartButton.addEventListener('click', () => {
            ipcRenderer.send('restart_app');
        });
        notification.appendChild(restartButton);
        document.body.appendChild(notification);
    });
});
