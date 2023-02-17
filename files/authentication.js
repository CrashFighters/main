import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js';
import {
    getAuth,
    signOut,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    signInWithRedirect,
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    sendEmailVerification
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

const email = document.getElementById('email');
const emailVerified = document.getElementById('emailVerified');

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
let currentUser;

onAuthStateChanged(auth, update);
function update(user) {
    currentUser = user;
    console.log(user.providerData)
    if (user) {
        email.innerText = user.email
        emailVerified.innerText = user.emailVerified ? 'Email verified' : 'Email not verified'
    } else {
        email.innerText = 'Not logged in'
        emailVerified.innerText = 'Not logged in'
    }
}

window.google = async () => {

    try {
        await signInWithRedirect(auth, new GoogleAuthProvider());
    } catch (e) {
        throw e
    }

}

window.signup = async () => {

    try {
        const { user } = await createUserWithEmailAndPassword(auth, prompt('Email'), prompt('Password'));
        if (!user.emailVerified)
            await sendEmailVerification(user,)
    } catch (e) {
        throw e
    }

}

window.login = async () => {

    try {
        await signInWithEmailAndPassword(auth, prompt('Email'), prompt('Password'));
    } catch (e) {
        throw e
    }

}

window.logout = async () => {

    try {
        await signOut(auth);
    } catch (e) {
        throw e
    }

}