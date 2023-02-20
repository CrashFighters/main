import {
    multiFactor,
    PhoneAuthProvider,
    RecaptchaVerifier,
    PhoneMultiFactorGenerator
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js';

const { firebase: { auth } } = (await import('/sdk/auth.js'))._;

const _2FaRecaptchaButton = document.getElementById('2faRecaptchaButton');
if (!_2FaRecaptchaButton)
    throw new Error('No element with id "2faRecaptchaButton" found');

let recaptchaDoneCallbacks = [];
let recaptchaSolved = false;
const __recaptchaVerifier = new RecaptchaVerifier(_2FaRecaptchaButton, {
    size: 'normal',
    callback: () => {
        for (const recaptchaDoneCallback of recaptchaDoneCallbacks)
            recaptchaDoneCallback(__recaptchaVerifier);
        recaptchaSolved = true;
    },
    'expired-callback': () => {
        recaptchaSolved = false;
    }
}, auth);

function getRecaptchaVerifier() {
    if (recaptchaSolved) {
        recaptchaDoneCallbacks = [];
        __recaptchaVerifier.clear();
        recaptchaSolved = false;
    };

    return new Promise(res => {
        recaptchaDoneCallbacks.push(res);
    });
}

export const enable = async (phoneNumber, displayName) => {
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

    const recaptchaVerifier = await getRecaptchaVerifier();

    const phoneAuthProvider = new PhoneAuthProvider(auth);
    phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, recaptchaVerifier);

    return async (verificationId, verificationCode) => {
        // when user claims they have confirmed the code, can be called multiple times

        const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
        const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(credential);
        multiFactor(auth.currentUser).enroll(multiFactorAssertion, displayName);
    };

};

window.a = enable; //todo: remove