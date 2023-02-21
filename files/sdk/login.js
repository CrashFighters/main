import {
    signInWithEmailAndPassword,
    signInWithPopup,
    signInWithRedirect,
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail as firebaseSendPasswordResetEmail,
    getMultiFactorResolver,
    PhoneAuthProvider,
    PhoneMultiFactorGenerator
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js';

const { auth } = (await import('/sdk/auth.js'))._.firebase;

export async function loginWithGoogle() {
    try {
        if (window.innerWidth > window.innerHeight)
            await signInWithPopup(auth, new GoogleAuthProvider());
        else
            await signInWithRedirect(auth, new GoogleAuthProvider());
    } catch (e) {
        throw e;
    };
};

export async function loginWithEmail(email, password) {
    try {
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
let recaptchaObject;
export async function prepare2fa() {
    const { getRecaptchaVerifier } = (await import('/sdk/2fa.js'))._;
    ([recaptchaVerifier, recaptchaObject] = await getRecaptchaVerifier());

    return recaptchaObject;
};

let resolver;
export async function get2faMethods(error) {
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

    const { hide2faRecaptchaButton } = (await import('/sdk/2fa.js'))._;
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