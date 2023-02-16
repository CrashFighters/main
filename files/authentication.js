import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js';

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

window.login = async () => {

    await signInWithEmailAndPassword(auth, 'oscarknap@ziggo.nl', '123456');
    a.innerText = 'yest';

}

window.logout = async () => {

    await signOut(auth);
    a.innerText = 'no';

}