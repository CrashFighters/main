import {
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js';

const { app, auth } = window.firebase;

window.login = {
    loginWithGoogle: async () => {
        try {
            await signInWithPopup(auth, new GoogleAuthProvider());
        } catch (e) {
            throw e;
        };
    },
    loginWithEmail: async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (e) {
            throw e;
        };
    },
    createEmailAccount: async (email, password) => {
        try {
            const { user } = await createUserWithEmailAndPassword(auth, email, password);
            await sendEmailVerification(user);
        } catch (e) {
            throw e;
        };
    },
    resendVerificationEmail: async (email, password) => {
        if (!auth.currentUser)
            throw new Error('User is not logged in');

        try {
            await sendEmailVerification(auth.currentUser);
        } catch (e) {
            throw e;
        };
    },
    sendPasswordResetEmail: async (email) => {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (e) {
            throw e;
        };
    };
}