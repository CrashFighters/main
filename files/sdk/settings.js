import {
    updateProfile
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js';

import '/sdk/auth.js';

const { updateUserObject, onStateChange, firebase: { app, auth } } = (await import('/sdk/auth.js'))._;

window.settings = {
    setDisplayName: async (displayName) => {
        await updateProfile(auth.currentUser, {
            displayName
        });
        updateUserObject(auth.currentUser);
        for (const callback of onStateChange)
            callback(window.auth.user);
    },
    setLanguage: async (language) => {
        auth.languageCode = language;
        updateUserObject(auth.currentUser);
        for (const callback of onStateChange)
            callback(window.auth.user);
    },
    setPicture: async (picture) => {
        await updateProfile(auth.currentUser, {
            photoURL: picture
        });
        updateUserObject(auth.currentUser);
        for (const callback of onStateChange)
            callback(window.auth.user);
    }
}