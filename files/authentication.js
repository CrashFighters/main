import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js';
import {
    getAuth,
    signOut,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    signInWithRedirect,
    GoogleAuthProvider,
    createUserWithEmailAndPassword
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

onAuthStateChanged(auth, update);
function update(user) {
    console.log(user)
    if (user)
        a.innerText = user.email
    else
        a.innerText = 'Not logged in'
}

window.login = async () => {

    try {
        // await signInWithEmailAndPassword(auth, 'oscarknap@ziggo.nl', '123456');
        // await signInWithPopup(auth, new GoogleAuthProvider());
        await signInWithRedirect(auth, new GoogleAuthProvider());
        // await createUserWithEmailAndPassword(auth, 'oscarknap@ziggo.nl', '123456')
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