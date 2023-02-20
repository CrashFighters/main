import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js';
import {
    getAuth,
    onAuthStateChanged,
    signOut,
    updateProfile,
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js';

import { firebaseConfig } from '/common/apiKeys.js';

const app = initializeApp(firebaseConfig);

if (doesDocumentIncludeScript('/sdk/recaptcha.js')) {
    const { initAppCheck } = await import('/sdk/recaptcha.js');
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
    if (!window.auth.user)
        // if the user is not logged in
        window.open('/login', '_self');
};

export const signup = () => {
    window.open('/login?signup=true', '_self');
};

async function updateUserObject(newUser) {
    if (!newUser) {
        window.auth.user = null;
        return;
    };
    if (newUser.multiFactor?.enrolledFactors?.length > 1)
        console.error(new Error('Multiple 2FA methods are not supported yet'));

    if (!newUser.photoURL)
        await updateProfile(newUser, {
            photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                newUser.displayName ?? newUser.email
            )}`,
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
        id: newUser.uid,
        '2fa': !newUser.multiFactor?.enrolledFactors?.[0] ? undefined : {
            creationTime: new Date(newUser.multiFactor.enrolledFactors[0].enrollmentTime),
            type: newUser.multiFactor.enrolledFactors[0].factorId,
            displayName: newUser.multiFactor.enrolledFactors[0].displayName,
            phoneNumber: newUser.multiFactor.enrolledFactors[0].phoneNumber,
            id: newUser.multiFactor.enrolledFactors[0].uid
        }
    };
}

export const _ = {
    firebase: {
        app,
        auth,
    },
    updateUserObject,
    onStateChangeCallbacks,
};

window.auth = {
    onStateChange,
    logout,
    login,
    signup,
    user: null,
    _,
};

onStateChange(() => updateUserObject(auth.currentUser));

function doesDocumentIncludeScript(url) {
    const scripts = [...document.getElementsByTagName('script')];
    return Boolean(scripts.find((script) => script.src.endsWith(url)));
}
