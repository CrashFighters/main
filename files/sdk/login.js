import {
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail as firebaseSendPasswordResetEmail
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js';

const { auth } = (await import('/sdk/auth.js'))._.firebase;

export const loginWithGoogle = async () => {
    try {
        await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (e) {
        throw e;
    };
};

export const loginWithEmail = async (email, password) => {
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
        throw e;
    };
};

export const createEmailAccount = async (email, password) => {
    try {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(user);
    } catch (e) {
        throw e;
    };
};

export const resendVerificationEmail = async () => {
    if (!auth.currentUser)
        throw new Error('User is not logged in');

    try {
        await sendEmailVerification(auth.currentUser);
    } catch (e) {
        throw e;
    };
};

export const sendPasswordResetEmail = async (email) => {
    try {
        await firebaseSendPasswordResetEmail(auth, email);
    } catch (e) {
        throw e;
    };
};