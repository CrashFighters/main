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
const __recaptchaVerifier = new RecaptchaVerifier(_2FaRecaptchaButton, {
    size: 'normal',
    callback: () => {
        for (const recaptchaDoneCallback of recaptchaDoneCallbacks)
            recaptchaDoneCallback(__recaptchaVerifier);
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

export const enable = async (phoneNumber, displayName) => {
    if (!window.auth.user)
        throw new Error('User is not logged in');
    if (!window.auth.user.emailVerified)
        throw new Error('User email must be verified');

    const multiFactorUser = multiFactor(auth.currentUser);
    if (multiFactorUser.enrolledFactors.length > 0)
        throw new Error('User already has 2fa enabled');

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