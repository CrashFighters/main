import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js';
import {
    multiFactor,
    getAuth,
    onAuthStateChanged,
    signOut,
    updateProfile,
    useDeviceLanguage,
    getIdToken
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js';

import { init } from '/js/appCheck.js';
import { firebaseConfig } from '/common/apiKeys.js';
import { setCookie } from '/common/cookie.js';

const app = initializeApp(firebaseConfig);

await init(app);

const auth = getAuth(app);

const onStateChangeCallbacks = [];
export const onStateChange = (callback) => {
    onStateChangeCallbacks.push(callback);
};

let first = true;
onAuthStateChanged(auth, async () => {
    const promises = [];
    for (const callback of onStateChangeCallbacks)
        promises.push(callback(window.auth.user));

    await Promise.all(promises);

    if (!first)
        if (window.privateFile === true)
            window.location.reload();

    first = false;
});

export async function getPermission(permission) {
    const response = await fetch(`/api/getPermission?permission=${encodeURIComponent(JSON.stringify(permission))}`, {
        headers: {
            ...await getAuthHeaders()
        }
    });
    const result = await response.json();

    return result;
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

async function updateCookies() {
    setCookie('authHeaders', JSON.stringify(await getAuthHeaders()));
}

function updateDeviceLanguage() {
    useDeviceLanguage(auth);
}

async function updateUserObject(newUser) {

    if (!newUser) {
        window.auth.user = null;
        return;
    };

    if (!newUser.photoURL)
        await updateProfile(newUser, {
            photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                newUser.displayName ?? newUser.email
            )}`
        });

    let loginMethod = 'unknown';
    if (newUser.providerData.length > 1)
        console.error(new Error("Multiple login methods shouldn't be possible, because linking is disabled"));
    else if (newUser.providerData[0].providerId === 'password')
        loginMethod = 'email';
    else if (newUser.providerData[0].providerId === 'google.com')
        loginMethod = 'google';
    else if (newUser.providerData[0].providerId === 'github.com')
        loginMethod = 'github';

    const email = newUser.email ?? newUser.providerData[0]?.email ?? null;

    const multiFactorUser = multiFactor(auth.currentUser);

    window.auth.user = {
        loginMethod,
        picture: newUser.photoURL,
        displayName: newUser.displayName,
        email,
        emailVerified: newUser.email ? newUser.emailVerified : true,
        isAnonymous: newUser.isAnonymous,
        creationTime: new Date(newUser.metadata.creationTime),
        lastSignInTime: new Date(newUser.metadata.lastSignInTime),
        id: newUser.uid,
        '2fa': !multiFactorUser?.enrolledFactors ? [] : multiFactorUser?.enrolledFactors.map(factor => ({
            creationTime: new Date(factor.enrollmentTime),
            type: factor.factorId,
            displayName: factor.displayName,
            phoneNumber: factor.phoneNumber,
            id: factor.uid
        }))
    };
}

const getAuthHeaders = async () => ({
    auth_token: auth.currentUser ? await getIdToken(auth.currentUser) : undefined
});

export const _ = {
    firebase: {
        app,
        auth
    },
    updateUserObject,
    onStateChangeCallbacks,
    getAuthHeaders
};

window.auth = {
    onStateChange,
    getPermission,
    logout,
    login,
    signup,
    user: null,
    _
};

onStateChange(() => updateUserObject(auth.currentUser));
onStateChange(updateCookies);
onStateChange(updateDeviceLanguage);