import {
    updateProfile
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js';

const { app, auth } = window.firebase;

window.settings = {
    setDisplayName: async (displayName) => {
        await updateProfile(auth.currentUser, {
            displayName
        });
    },
    setLanguage: async (language) => {
        auth.languageCode = language;
    },
    setPicture: async (picture) => {
        await updateProfile(auth.currentUser, {
            photoURL: picture
        });
    }
}