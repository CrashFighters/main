/*

--fileRequirements--
/sdk/firebase.js
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

const { auth } = (await import('/sdk/firebase.js'))._;
import { logEvent } from '/js/analytics.js';

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
            await logEvent('login', { method: 'github', initiator, type: 'redirect' });
        } else {
            await signInWithPopup(auth, githubProvider);
            await logEvent('login', { method: 'github', initiator, type: 'popup' });
        }
    } catch (e) {
        throw e;
    };
}

export async function loginWithEmail(email, password, initiator) {
    try {
        if (!initiator)
            throw new Error('No initiator provided in loginWithEmail')

        await signInWithEmailAndPassword(auth, email, password);
        await logEvent('login', { method: 'email', initiator, type: 'embedded' });
    } catch (e) {
        throw e;
    };
};

export async function createEmailAccount(email, password, initiator) {
    try {
        if (!initiator)
            throw new Error('No initiator provided in createEmailAccount')

        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(user);
        await logEvent('sign_up', { method: 'email', initiator, type: 'embedded', with2fa: false });
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

    await logEvent('login_2fa_recaptcha_show');
    const result = await getRecaptchaVerifier();
    await logEvent('login_2fa_recaptcha_solve');

    recaptchaVerifier = result[0];
    const recaptchaObject = result[1];

    return recaptchaObject;
};

let resolver;
export async function get2faMethods(error) {
    if (!recaptchaVerifier)
        throw new Error('prepare2fa not called');

    resolver = getMultiFactorResolver(auth, error);
    await logEvent('login_2fa_methods_show', { amount: resolver.hints.length });

    return resolver.hints.map((hint) => ({
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
    await logEvent('login_2fa_code_send', { method: 'phone' });
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

    await logEvent('login', { method: 'email', initiator: 'button', type: 'embedded', with2fa: true });
};