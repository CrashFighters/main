/*

--fileRequirements--
/common/apiKeys.js
/common/cookie.js
/js/appCheck.js
/js/analytics.js
--endFileRequirements--

*/

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js';
import {
    multiFactor,
    getAuth,
    onAuthStateChanged,
    signOut,
    updateProfile,
    getIdToken
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js';

import { firebaseConfig } from '/common/apiKeys.js';
import { setCookie } from '/common/cookie.js';
import { init as initAppCheck, _ as appCheck_ } from '/js/appCheck.js';
import { init as initAnalytics, logEvent } from '/js/analytics.js';

const { getAppCheckHeaders } = appCheck_;

//todo: create separate core js file that creates the app and initializes appCheck and analytics
const app = initializeApp(firebaseConfig);

await initAppCheck(app);
initAnalytics(app);

const auth = getAuth(app);

const onStateChangeCallbacks = [];
export function onStateChange(callback) {
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
    setCookie('authHeaders', JSON.stringify(await getAuthHeaders()));
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
    auth_token: auth.currentUser ? await getIdToken(auth.currentUser) : undefined,
    ...(await getAppCheckHeaders())
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
    logout,
    login,
    signup,
    user: null,
    _
};

onStateChange(() => updateUserObject(auth.currentUser));
onStateChange(updateCookies);