/*

--fileRequirements--
/common/cookie.js
/js/analytics.js
--endFileRequirements--

*/

import {
    multiFactor,
    getAuth,
    onAuthStateChanged,
    signOut,
    updateProfile,
    getIdToken
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js';

import { setCookie } from '/common/cookie.js';
import { logEvent } from '/js/analytics.js';

let auth;
let stateChangeCalled = false;
export function init(app) {
    auth = getAuth(app);

    onAuthStateChanged(auth, async () => {
        const promises = [];
        for (const callback of onStateChangeCallbacks)
            promises.push(callback(window.auth.user));

        await Promise.all(promises);

        if (stateChangeCalled)
            if (window.privateFile === true)
                window.location.reload();

        stateChangeCalled = true;
    });

    return auth;
};

const getAuthHeaders = async () => ({
    auth_token: auth.currentUser ? await getIdToken(auth.currentUser) : undefined
});

const onStateChangeCallbacks = [];
export const _ = {
    updateUserObject,
    onStateChangeCallbacks,
    getAuthHeaders
};

export function onStateChange(callback) {
    onStateChangeCallbacks.push(callback);

    if (stateChangeCalled)
        callback(window.auth.user);
};

export async function logout() {
    try {
        await signOut(auth);
        logEvent('logout');
    } catch (e) {
        throw e;
    }
};

export async function login() {
    if (window.auth.user)
        await logout();

    if (window.location.pathname !== '/login')
        window.open(`/login?redirect=${encodeURIComponent(location.href)}`, '_self');
};

export async function signup() {
    if (window.auth.user)
        await logout();

    if (window.location.pathname !== '/login')
        window.open(`/login?signup=true&redirect=${encodeURIComponent(location.href)}`, '_self');
};

async function updateCookies() {
    const { getHeaders } = await import('/sdk/firebase.js');
    setCookie('authHeaders', JSON.stringify(await getHeaders())); //todo: rename authHeaders cookie to something else, because appCheck is also included. Maybe requestHeaders?
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
        console.error(new Error("Multiple login methods shouldn't be possible, because linking is disabled. Setting loginMethod to 'unknown'"));
    else if (newUser.providerData[0].providerId === 'password')
        loginMethod = 'email';
    else if (newUser.providerData[0].providerId === 'google.com')
        loginMethod = 'google';
    else if (newUser.providerData[0].providerId === 'github.com')
        loginMethod = 'github';
    else if (newUser.providerData[0].providerId === 'anonymous')
        loginMethod = 'anonymous';

    const email = newUser.email ?? newUser.providerData[0]?.email ?? null;

    const multiFactorUser = multiFactor(newUser);

    window.auth.user = {
        loginMethod,
        picture: newUser.photoURL,
        displayName: newUser.displayName,
        email,
        emailVerified: newUser.email ? newUser.emailVerified : true,
        phoneNumber: newUser.phoneNumber,
        creationTime: new Date(newUser.metadata.creationTime),
        lastSignInTime: new Date(newUser.metadata.lastSignInTime),
        id: newUser.uid,
        '2fa': !multiFactorUser?.enrolledFactors ? [] : multiFactorUser?.enrolledFactors.map((factor) => ({
            creationTime: new Date(factor.enrollmentTime),
            type: factor.factorId,
            displayName: factor.displayName,
            phoneNumber: factor.phoneNumber,
            id: factor.uid
        }))
    };
}

window.auth = {
    onStateChange,
    logout,
    login,
    signup,
    user: null,
    _
};

onStateChange(() => updateUserObject(auth.currentUser));
onStateChange(updateCookies);