import {
    updateProfile
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js';

window.settings = {
    setDisplayName: async (displayName) => {
        updateProfile(auth.currentUser, {
            displayName
        });
    },
    setLanguage: async (language) => {
        window.firebase.auth.languageCode = language;
    },
    setPicture: async (picture) => {
        updateProfile(auth.currentUser, {
            photoURL: picture
        });
    }
}