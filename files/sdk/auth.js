import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
    signOut,
    updateProfile
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";

import { firebaseConfig } from "/common/apiKeys.js";

const app = initializeApp(firebaseConfig);

if (doesDocumentIncludeScript('/sdk/captcha.js')) {
    const { initAppCheck } = await import('/sdk/captcha.js');
    await initAppCheck(app);
}

const auth = getAuth(app);

let onStateChangeCallbacks = [];
export const onStateChange = (callback) => {
    onStateChangeCallbacks.push(callback);
    onAuthStateChanged(auth, () => {
        callback(window.auth.user);
    });
};

export const logout = async () => {
    try {
        await signOut(auth);
    } catch (e) {
        throw e;
    }
};

export const login = () => {
    if (!window.auth.user) // if the user is not logged in
        window.open("/login", "_self");
};

export const signup = () => {
    window.open("/login?signup=true", "_self");
};

async function updateUserObject(newUser) {
    if (!newUser) {
        window.auth.user = null;
        return;
    };

    if (!newUser.photoURL)
        await updateProfile(newUser, {
            photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(newUser.displayName ?? newUser.email)}`
        });

    window.auth.user = {
        picture: newUser.photoURL,
        displayName: newUser.displayName,
        language: auth.languageCode,
        email: newUser.email,
        emailVerified: newUser.emailVerified,
        isAnonymous: newUser.isAnonymous,
        creationTime: new Date(newUser.metadata.creationTime),
        lastSignInTime: new Date(newUser.metadata.lastSignInTime),
    };
};

export const _ = {
    firebase: {
        app,
        auth
    },
    updateUserObject,
    onStateChangeCallbacks
};

window.auth = {
    onStateChange,
    logout,
    login,
    signup,
    user: null,
    _
}

onStateChange(() => updateUserObject(auth.currentUser));

function doesDocumentIncludeScript(url) {
    const scripts = [...document.getElementsByTagName('script')];
    return Boolean(scripts.find(script => script.src.endsWith(url)));
};