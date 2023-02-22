import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js';
import {
    getAuth,
    onAuthStateChanged,
    signOut,
    updateProfile,
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js';

import { init } from '/sdk/appCheck.js';
import { firebaseConfig } from '/common/apiKeys.js';

const app = initializeApp(firebaseConfig);

await init(app);

const auth = getAuth(app);

const onStateChangeCallbacks = [];
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
    if (!window.auth.user) // if the user is not logged in
        if (window.location.pathname !== '/login')
            window.open(`/login?redirect=${encodeURIComponent(location.href)}`, '_self');
};

export const signup = () => {
    if (!window.auth.user) // if the user is not logged in
        if (window.location.pathname !== '/login')
            window.open(`/login?signup=true&redirect=${encodeURIComponent(location.href)}`, '_self');
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

    let loginMethod = 'unknown';
    if (newUser.providerData.length > 1)
        console.error(new Error("Multiple login methods shouldn't be possible, because linking is disabled"));
    else if (newUser.providerData[0].providerId === 'password')
        loginMethod = 'email';
    else if (newUser.providerData[0].providerId === 'google.com')
        loginMethod = 'google';

    const email = newUser.email ?? newUser.providerData[0]?.email ?? null;

    window.auth.user = {
        loginMethod,
        picture: newUser.photoURL,
        displayName: newUser.displayName,
        language: auth.languageCode,
        email,
        emailVerified: newUser.email ? newUser.emailVerified : true,
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