import {
    multiFactor,
    PhoneAuthProvider,
    RecaptchaVerifier,
    PhoneMultiFactorGenerator
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js';

const { firebase: { auth } } = (await import('/sdk/auth.js'))._;

const id = '2faRecaptchaButton';

const _2FaRecaptchaButton = document.getElementById(id);
if (!_2FaRecaptchaButton)
    throw new Error(`No element with id "${id}" found`);

let recaptchaDoneCallbacks = [];
let recaptchaState = 'ready';
let recaptchaObject = { state: recaptchaState };
const __recaptchaVerifier = new RecaptchaVerifier(_2FaRecaptchaButton, {
    size: 'normal',
    callback: () => {
        for (const recaptchaDoneCallback of recaptchaDoneCallbacks)
            recaptchaDoneCallback([__recaptchaVerifier, recaptchaObject]);
        if (recaptchaState === 'waiting')
            recaptchaState = 'success'
        else
            recaptchaState = 'successBefore';
    },
    'expired-callback': () => {
        recaptchaState = 'expired';
    }
}, auth);
let recaptchaRenderPromise = __recaptchaVerifier.render();

export const _ = {
    getRecaptchaVerifier() {
        _2FaRecaptchaButton.style.display = null;
        recaptchaObject = { state: recaptchaState };

        if (['success', 'expired'].includes(recaptchaState)) {
            recaptchaDoneCallbacks = [];
            __recaptchaVerifier.clear();
            recaptchaRenderPromise = __recaptchaVerifier.render();
        };
        if (recaptchaState === 'successBefore') {
            recaptchaState = 'success';
            return Promise.resolve(__recaptchaVerifier);
        };
        recaptchaState = 'waiting';

        return new Promise(async res => {
            await recaptchaRenderPromise;
            recaptchaDoneCallbacks.push(res);
        });
    },
    hide2faRecaptchaButton() {
        _2FaRecaptchaButton.style.display = 'none';
    }
};

export const add = async (phoneNumber, displayName) => {
    if (!window.auth.user)
        throw new Error('User is not logged in');
    if (window.auth.user.loginMethod !== 'email')
        throw new Error('User must be logged in with email');
    if (!window.auth.user.emailVerified)
        throw new Error('User email must be verified');

    const multiFactorUser = multiFactor(auth.currentUser);

    const multiFactorSession = await multiFactorUser.getSession();
    const phoneInfoOptions = {
        phoneNumber: phoneNumber,
        session: multiFactorSession
    };

    const recaptchaVerifier = await _.getRecaptchaVerifier();

    const phoneAuthProvider = new PhoneAuthProvider(auth);
    const verificationId = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, recaptchaVerifier);

    return async (verificationCode) => {
        const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
        const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(credential);
        await multiFactor(auth.currentUser).enroll(multiFactorAssertion, displayName);
    };
};