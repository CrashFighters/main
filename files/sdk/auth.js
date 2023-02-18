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
const auth = getAuth(app);

async function updateUserObject(user) {
    if (!user) return (window.auth.user = null);

    if (!user.photoURL)
        await updateProfile(user, {
            photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName ?? user.email)}`
        });

    window.auth.user = {
        picture: user.photoURL,
        displayName: user.displayName,
        language: auth.languageCode,
        email: user.email,
        emailVerified: user.emailVerified,
        isAnonymous: user.isAnonymous,
        creationTime: new Date(user.metadata.creationTime),
        lastSignInTime: new Date(user.metadata.lastSignInTime),
    };
};

let onStateChange = [];

window.auth = {
    logout: async () => {
        try {
            await signOut(auth);
        } catch (e) {
            throw e;
        }
    },
    onStateChange: (callback) => {
        onStateChange.push(callback);
        onAuthStateChanged(auth, () => {
            callback(window.auth.user);
        });
    },
    login: () => {
        window.open("/login", "_self");
    },
    signup: () => {
        window.open("/login?signup=true", "_self");
    },
    user: null,
};

window._auth = {
    firebase: {
        app,
        auth
    },
    updateUserObject,
    onStateChange
};

window.auth.onStateChange(() => updateUserObject(auth.currentUser));