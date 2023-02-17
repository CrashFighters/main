import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js';
import {
    getAuth,
    onAuthStateChanged,
    signOut
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js';

const firebaseConfig = {
    apiKey: "AIzaSyApP_TsV5cVMNXDrM5ASVFbJpxnZ7KiEJE",
    authDomain: "crashfighters.firebaseapp.com",
    databaseURL: "https://crashfighters-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "crashfighters",
    storageBucket: "crashfighters.appspot.com",
    messagingSenderId: "478395146629",
    appId: "1:478395146629:web:ffe0bf832bde931bc424ec",
    measurementId: "G-6SF1JVH5WC"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

onAuthStateChanged(auth, updateUserObject);

function updateUserObject(user) {
    if (!user)
        return window.auth.user = null;

    window.auth.user = {
        language: auth.languageCode,
        email: user.email,
        emailVerified: user.emailVerified,
        isAnonymous: user.isAnonymous,
        creationTime: new Date(user.metadata.creationTime),
        lastSignInTime: new Date(user.metadata.lastSignInTime)
    };
};

window.auth = {
    signOut: async () => {
        try {
            await signOut(auth);
        } catch (e) {
            throw e
        };
    },
    onStateChanged: callback => {
        onAuthStateChanged(auth, callback);
    },
    login: () => {
        window.open('/login', '_self');
    },
    signup: () => {
        window.open('/signup', '_self');
    },
    user: null
};

window.firebase = {
    app,
    auth
};