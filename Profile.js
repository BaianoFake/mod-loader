class Profile {
    constructor(name, modFolderPath) {
        this.name = name;
        this.modFolderPath = modFolderPath;
        this.mods = [];
    }

    addMod(mod) {
        this.mods.push(mod);
    }

    removeMod(modName) {
        this.mods = this.mods.filter(mod => mod.name !== modName);
    }

    getMods() {
        return this.mods;
    }

    setModFolderPath(path) {
        this.modFolderPath = path;
    }

    getModFolderPath() {
        return this.modFolderPath;
    }
}

module.exports = Profile;
