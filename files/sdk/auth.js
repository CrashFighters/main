import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
    signOut,
    updateProfile
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyApP_TsV5cVMNXDrM5ASVFbJpxnZ7KiEJE",
    authDomain: "crashfighters.firebaseapp.com",
    databaseURL:
        "https://crashfighters-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "crashfighters",
    storageBucket: "crashfighters.appspot.com",
    messagingSenderId: "478395146629",
    appId: "1:478395146629:web:ffe0bf832bde931bc424ec",
    measurementId: "G-6SF1JVH5WC",
};

const app = initializeApp(firebaseConfig);

if (doesDocumentIncludeScript('/sdk/captcha.js')) {
    const { init } = await import('/sdk/captcha.js');
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
    window.open("/login", "_self");
};

export const signup = () => {
    window.open("/login?signup=true", "_self");
};

export let user = null;

async function updateUserObject(user) {
    if (!user) return (window.auth.user = null);

    if (!user.photoURL)
        await updateProfile(user, {
            photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName ?? user.email)}`
        });

    user = {
        picture: user.photoURL,
        displayName: user.displayName,
        language: auth.languageCode,
        email: user.email,
        emailVerified: user.emailVerified,
        isAnonymous: user.isAnonymous,
        creationTime: new Date(user.metadata.creationTime),
        lastSignInTime: new Date(user.metadata.lastSignInTime),
    };
    window.auth.user = user;
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
    user,
    _
}

onStateChange(() => updateUserObject(auth.currentUser));

function doesDocumentIncludeScript(url) {
    const scripts = [...document.getElementsByTagName('script')];
    return Boolean(scripts.find(script => script.src.endsWith(url)));
};