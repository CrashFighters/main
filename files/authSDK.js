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
        window.open('/login', '_self')
    },
    signup: () => {
        window.open('/signup', '_self')
    }
};

window.firebase = {
    app,
    auth
};

// window.signup = async () => {

//     try {
//         const { user } = await createUserWithEmailAndPassword(auth, prompt('Email'), prompt('Password'));
//         if (!user.emailVerified)
//             await sendEmailVerification(user,)
//     } catch (e) {
//         throw e
//     }

// }

// window.login = async () => {

//     try {
//         await signInWithEmailAndPassword(auth, prompt('Email'), prompt('Password'));
//     } catch (e) {
//         throw e
//     }

// }