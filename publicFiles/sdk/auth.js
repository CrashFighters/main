/*

--fileRequirements--
/common/cookie.js
/js/analytics.js
/js/performance.js
--endFileRequirements--

*/

import {
    multiFactor,
    getAuth,
    onAuthStateChanged,
    signOut,
    updateProfile,
    getIdToken,
    signInWithCredential,
    GoogleAuthProvider
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js';

import { setCookie, getCookie, deleteCookie } from '/common/cookie.js';

import { logEvent } from '/js/analytics.js';
import { startTrace, stopTrace } from '/js/performance.js';

let auth;
let preventFirstAuthStateChange = false;
let stateChangeCalled = false;
export function init(app) {
    auth = getAuth(app);

    onAuthStateChanged(auth, async () => {
        if ((!stateChangeCalled) && preventFirstAuthStateChange) {
            preventFirstAuthStateChange = false;
            return;
        }

        const promises = [];
        for (const callback of onStateChangeCallbacks)
            promises.push(callback(window.auth.user));

        await Promise.all(promises);

        if (stateChangeCalled)
            if (window.privateFile === true)
                window.location.reload();

        stateChangeCalled = true;
    });

    checkGoogleSignInRedirect();

    return auth;
};

const getAuthHeaders = async () => ({
    auth_token: auth.currentUser ? await getIdToken(auth.currentUser) : undefined
});

const checkGoogleSignInRedirect = async () => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const signInWithGoogleRedirect = urlSearchParams.get('signInWithGoogleRedirect') === 'true';
    if (!signInWithGoogleRedirect) return;

    preventFirstAuthStateChange = true;

    urlSearchParams.delete('signInWithGoogleRedirect');
    window.history.replaceState({}, document.title, `${window.location.pathname}${urlSearchParams.toString() === '' ? '' : '?'}${urlSearchParams.toString()}`);

    try {

        const googleSignInIdToken = getCookie('g_csrf_token');
        if (googleSignInIdToken) {
            // user got redirected from login with Google redirect

            deleteCookie('g_csrf_token');
            await signInWithGoogleSignInIdToken(googleSignInIdToken);
        } else
            throw new Error('No g_csrf_token cookie found');

    } catch (e) {
        window.location.replace(`/login?redirect=${encodeURIComponent(window.location.href)}&loginError=${encodeURIComponent(JSON.stringify({ error: { message: e.message } }))}`);
    }
}

async function signInWithGoogleSignInIdToken(googleSignInIdToken) {
    startTrace('auth_getGoogleSignInRedirectCredential')
    const response = await fetch(`/api/getGoogleSignInCredential?token=${googleSignInIdToken}`);
    stopTrace('auth_getGoogleSignInRedirectCredential')

    if ((!response.ok))
        throw new Error(`Status code ${response.status} (${response.statusText}) from /api/getGoogleSignInCredential`);

    const credential = await response.text();

    await signInWithCredential(auth, GoogleAuthProvider.credential(credential));
    logEvent('login', { method: 'google', initiator: 'button', type: 'redirect' });
}

const onStateChangeCallbacks = [];
export const _ = {
    updateUserObject,
    onStateChangeCallbacks,
    getAuthHeaders
};

onStateChange(() => updateUserObject(auth.currentUser));
onStateChange(updateCookies);

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