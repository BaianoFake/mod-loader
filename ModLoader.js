const Profile = require('./Profile');

class ModLoader {
    constructor() {
        this.profiles = [];
        this.currentProfile = null;
    }

    addProfile(profile) {
        this.profiles.push(profile);
    }

    switchProfile(profileName) {
        this.currentProfile = this.profiles.find(p => p.name === profileName);
    }

    getCurrentProfile() {
        return this.currentProfile;
    }

    setProfileModFolder(profileName, folderPath) {
        const profile = this.profiles.find(p => p.name === profileName);
        if (profile) {
            profile.setModFolderPath(folderPath);
        }
    }
}

module.exports = ModLoader;
