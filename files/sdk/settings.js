import {
    updateProfile,
    multiFactor,
    PhoneAuthProvider,
    RecaptchaVerifier,
    PhoneMultiFactorGenerator
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js';

import '/sdk/auth.js';

const { updateUserObject, onStateChangeCallbacks, firebase: { auth } } = (await import('/sdk/auth.js'))._;

let recaptchaDoneCallbacks = [];
let recaptchaCalled = false;
const __recaptchaVerifier = new RecaptchaVerifier('sign-in-button', {
    size: 'invisible',
    callback: () => {
        for (const recaptchaDoneCallback of recaptchaDoneCallbacks)
            recaptchaDoneCallback(__recaptchaVerifier);
        recaptchaCalled = true;
    }
}, auth);

function waitRecaptchaSuccess() {
    if (recaptchaCalled) {
        recaptchaDoneCallbacks = [];
        __recaptchaVerifier.clear();
        recaptchaCalled = false;
    };

    return new Promise(res => {
        recaptchaDoneCallbacks.push(res);
    });
}

export const setDisplayName = async (displayName) => {
    if (!window.auth.user)
        throw new Error('User is not logged in')

    await updateProfile(auth.currentUser, {
        displayName
    });
    updateUserObject(auth.currentUser);
    for (const callback of onStateChangeCallbacks)
        callback(window.auth.user);
};

export const setLanguage = async (language) => {
    auth.languageCode = language;
    updateUserObject(auth.currentUser);
    for (const callback of onStateChangeCallbacks)
        callback(window.auth.user);
};

export const setPicture = async (picture) => {
    if (!window.auth.user)
        throw new Error('User is not logged in')

    await updateProfile(auth.currentUser, {
        photoURL: picture
    });
    updateUserObject(auth.currentUser);
    for (const callback of onStateChangeCallbacks)
        callback(window.auth.user);
};

export const enable2fa = async (phoneNumber, displayName) => {
    if (!window.auth.user)
        throw new Error('User is not logged in');

    const multiFactorUser = multiFactor(auth.currentUser);
    if (multiFactorUser.enrolledFactors.length > 0)
        throw new Error('User already has 2fa enabled');

    const multiFactorSession = await multiFactorUser.getSession();
    const phoneInfoOptions = {
        phoneNumber: phoneNumber,
        session: multiFactorSession
    };

    const recaptchaVerifier = await waitRecaptchaSuccess();

    const phoneAuthProvider = new PhoneAuthProvider(auth);
    phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, recaptchaVerifier);

    return async (verificationId, verificationCode) => {
        // when user claims they have confirmed the code, can be called multiple times

        const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
        const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(credential);
        multiFactor(auth.currentUser).enroll(multiFactorAssertion, displayName);
    };

}