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

    // Instância do ModLoader
    const modLoader = new ModLoader();

    // Adicionar perfil
    addProfileBtn.addEventListener('click', () => {
        const profileName = prompt('Nome do perfil:');
        const modFolderPath = prompt('Caminho da pasta de mods:');
        if (profileName && modFolderPath) {
            const profile = new Profile(profileName, modFolderPath);
            modLoader.addProfile(profile);
            updateProfileSelector();
        }
    });

    // Atualizar selector de perfis
    function updateProfileSelector() {
        profileSelector.innerHTML = '';
        modLoader.profiles.forEach(profile => {
            const option = document.createElement('option');
            option.text = profile.name;
            profileSelector.add(option);
        });
    }

    // Trocar de perfil
    profileSelector.addEventListener('change', () => {
        const profileName = profileSelector.value;
        modLoader.switchProfile(profileName);
    });

    // Lógica para os botões de jogos (Minecraft, ZZZ, Genshin Impact)
    minecraftBtn.addEventListener('click', () => {
        ipcRenderer.send('navigate-to', 'minecraft');
    });

    zzzBtn.addEventListener('click', () => {
        ipcRenderer.send('navigate-to', 'zzz');
    });

    genshinBtn.addEventListener('click', () => {
        ipcRenderer.send('navigate-to', 'genshin');
    });
});
