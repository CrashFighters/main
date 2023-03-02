/*

--fileRequirements--
/sdk/auth.js
/js/analytics.js
--endFileRequirements--

*/

import {
    signInWithPopup,
    signInWithRedirect,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail as firebaseSendPasswordResetEmail,
    getMultiFactorResolver,
    GithubAuthProvider,
    PhoneAuthProvider,
    PhoneMultiFactorGenerator
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js';

import { logEvent } from '/js/analytics.js';

const { auth } = (await import('/sdk/auth.js'))._.firebase;

let isMobile;
export async function loginWithGithub(initiator) {
    try {
        if (!initiator)
            throw new Error('No initiator provided in loginWithGithub')

        if (!isMobile)
            ({ isMobile } = await import('/common/isMobile.js'));

        const githubProvider = new GithubAuthProvider();
        githubProvider.addScope('user:email');

        if (isMobile()) {
            await signInWithRedirect(auth, githubProvider);
            logEvent('login', { method: 'github', initiator, type: 'redirect', location: window.location.pathname });
        } else {
            await signInWithPopup(auth, githubProvider);
            logEvent('login', { method: 'github', initiator, type: 'popup', location: window.location.pathname });
        }
    } catch (e) {
        throw e;
    };
}

export async function loginWithEmail(email, password, initiator) {
    try {
        if (!initiator)
            throw new Error('No initiator provided in loginWithEmail')

        logEvent('login', { method: 'email', initiator, type: 'embedded', location: window.location.pathname });
        await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
        throw e;
    };
};

export async function createEmailAccount(email, password) {
    try {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(user);
    } catch (e) {
        throw e;
    };
};

export async function resendVerificationEmail() {
    if (!auth.currentUser)
        throw new Error('User is not logged in');

    try {
        await sendEmailVerification(auth.currentUser);
    } catch (e) {
        throw e;
    };
};

export async function sendPasswordResetEmail(email) {
    try {
        await firebaseSendPasswordResetEmail(auth, email);
    } catch (e) {
        throw e;
    };
};

let recaptchaVerifier;
export async function prepare2fa() {
    const { getRecaptchaVerifier } = (await import('/js/2fa.js'))._;
    const result = await getRecaptchaVerifier();

    recaptchaVerifier = result[0];
    const recaptchaObject = result[1];

    return recaptchaObject;
};

let resolver;
export function get2faMethods(error) {
    if (!recaptchaVerifier)
        throw new Error('prepare2fa not called');

    resolver = getMultiFactorResolver(auth, error);

    return resolver.hints.map(hint => ({
        displayName: hint.displayName,
        phoneNumber: hint.phoneNumber
    }));

}

let verificationId;
export async function send2fa(selectedIndex) {
    if (!recaptchaVerifier)
        throw new Error('prepare2fa not called');

    const { hide2faRecaptchaButton } = (await import('/js/2fa.js'))._;
    hide2faRecaptchaButton();

    const hint = resolver.hints[selectedIndex];
    if (hint.factorId !== PhoneMultiFactorGenerator.FACTOR_ID)
        throw new Error('Different 2FA method than phone message. This is not supported by Google, nor this app.');

    const phoneInfoOptions = {
        multiFactorHint: hint,
        session: resolver.session
    };

    const phoneAuthProvider = new PhoneAuthProvider(auth);
    verificationId = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, recaptchaVerifier);
    recaptchaVerifier = null;

    return {
        phoneNumber: hint.phoneNumber,
        displayName: hint.displayName
    }
};

export async function loginWith2fa(verificationCode) {
    if (!verificationId || !resolver)
        throw new Error('send2fa not called');

    const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
    const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(credential);

    await resolver.resolveSignIn(multiFactorAssertion);

    verificationId = null;
    resolver = null;
};