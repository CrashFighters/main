const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');
const signUpButton_mobile = document.getElementById('signUp_mobile');
const signInButton_mobile = document.getElementById('signIn_mobile');

const alertScript = document.createElement('script');
alertScript.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
document.head.appendChild(alertScript);

function coolAlert(message) {
    Swal.fire({
        backdrop: true,
        title: 'Thats a crash!',
        text: message,
        type: 'error',
        confirmButtonText: 'Alright',
        //button color
        confirmButtonColor: '#000'
    });
}

//remove old listeners
//todo: removeEventListener with new function doesn't do anything. Why is this here?
signUpButton.removeEventListener('click', () => {
    container.classList.add('right-panel-active');
});
signInButton.removeEventListener('click', () => {
    container.classList.remove('right-panel-active');
});
signUpButton_mobile.removeEventListener('click', () => {
    container.classList.add('right-panel-active');
});
signInButton_mobile.removeEventListener('click', () => {
    container.classList.remove('right-panel-active');
});

signUpButton.addEventListener('click', () => {
    container.classList.add('right-panel-active');
});

signInButton.addEventListener('click', () => {
    container.classList.remove('right-panel-active');
});

signUpButton_mobile.addEventListener('click', () => {
    container.classList.add('right-panel-active');
});

signInButton_mobile.addEventListener('click', () => {
    container.classList.remove('right-panel-active');
});

import { onStateChange } from '/sdk/auth.js';

import {
    loginWithEmail,
    createEmailAccount,
    prepare2fa,
    get2faMethods,
    send2fa,
    loginWith2fa
} from '/sdk/login.js';

import { setDisplayName } from '/sdk/settings.js';

import {
    minimalLoginRecaptchaScore,
    minimalSignupRecaptchaScore
} from '/common/settings.js';

import { createButton } from '/sdk/recaptcha.js';

const urlParams = new URLSearchParams(window.location.search);
const signup = urlParams.get('signup') === 'true';
if (signup)
    document.getElementById('container').classList.add('right-panel-active');

function redirect() {
    const redirectLocation = urlParams.get('redirect');

    const doRedirect = redirectLocation !== null;
    if (
        doRedirect &&
        new URL(redirectLocation).origin !== window.location.origin
    )
        Swal.fire({
            title: 'Do you want to continue to the external website?',
            text: redirectLocation,
            showCancelButton: true,
            confirmButtonColor: '#000',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Nope!',
            confirmButtonText: 'Yep!'
        }).then((result) => {
            if (result.isConfirmed) {
                window.open(redirectLocation, '_self')
            } else {
                window.open('/', '_self')
            }
        });
    else
        window.open('/', '_self')


}

let preventRedirect = false;
onStateChange((user) => {
    if (user && !preventRedirect) redirect();
});

const firebaseErrorCodes = {
    'auth/user-not-found': {
        errorCode: 'emailDoesNotExist',
        field: 'email'
    },
    'auth/missing-email': {
        errorCode: 'missingEmail',
        field: 'email'
    },
    'auth/invalid-email': {
        errorCode: 'invalidEmail',
        field: 'email'
    },
    'auth/email-already-in-use': {
        errorCode: 'emailAlreadyInUse',
        field: 'email'
    },
    'auth/wrong-password': {
        errorCode: 'wrongPassword',
        field: 'password'
    },
    'auth/weak-password': {
        errorCode: 'weakPassword',
        field: 'password'
    },
    'auth/too-many-requests': {
        errorCode: 'tooManyRequests'
    },
    'auth/multi-factor-auth-required': {
        errorCode: '2faRequired'
    },
    'auth/invalid-verification-code': {
        errorCode: 'invalidVerificationCode',
        field: 'verificationCode'
    },
    'auth/internal-error': {
        errorCode: 'firebaseAuthInternalError'
    }
};

const recaptchaStateNames = {
    ready: 'recaptchaNotSolved',
    expired: 'recaptchaExpired',
    error: 'recaptchaError'
};

let cachedErrorCodeMessages;
async function getErrorCodeMessages() {
    if (cachedErrorCodeMessages)
        return cachedErrorCodeMessages;

    cachedErrorCodeMessages = await fetch('/api/messages');
    cachedErrorCodeMessages = await cachedErrorCodeMessages.json();
    cachedErrorCodeMessages = cachedErrorCodeMessages.error.loginPage;

    return cachedErrorCodeMessages;
}

const loginFields = [
    'email',
    'password',
    'recaptcha',
    'verificationCode',
    '2fa-recaptcha'
];
async function handleLoginError({ errorCode, field, error }) {
    const message =
        (await getErrorCodeMessages())[errorCode] ??
        errorCode ??
        (error?.message
            ? `Error: ${error.message}`
            : 'An unknown error occurred');

    if (!field) return coolAlert(message);

    if (!loginFields.includes(field))
        throw new Error(`Invalid field: ${field}`);

    for (const loginFieldId of loginFields) {
        const feedbackElement = document.getElementById(
            `login-${loginFieldId}-feedback`
        );

        if (loginFieldId === field) feedbackElement.innerText = message;
        else feedbackElement.innerText = '';
    }
}
window.removeLoginErrorFeedback = () => {
    for (const loginFieldId of loginFields) {
        const feedbackElement = document.getElementById(
            `login-${loginFieldId}-feedback`
        );
        feedbackElement.innerText = '';
    }
};

function choose2faMethod(_2faMethods) {
    const chooseText = document.getElementById('choose2faMethodText');
    const choose = document.getElementById('choose2faMethod');

    return new Promise((res) => {
        for (const index in _2faMethods) {
            const { displayName, phoneNumber } = _2faMethods[index];

            const button = document.createElement('button');
            button.innerText = displayName
                ? `${displayName} (${phoneNumber})`
                : phoneNumber;
            button.addEventListener('click', () => {
                chooseText.style.display = 'none';
                choose.style.display = 'none';
                res(index);
            });

            choose.appendChild(button);
        }

        chooseText.style.display = null;
        choose.style.display = null;
    });
}

function wait2faRecaptchaSuccess(recaptchaObject) {
    return new Promise((res) => {
        recaptchaObject.onStateChange(() => {
            if (['success', 'successBefore'].includes(recaptchaObject.state))
                res();
        });
    });
}

let _2faError;
async function enable2fa(error) {
    _2faError = error;

    const _2faRecaptchaContainer = document.getElementById(
        '_2faRecaptchaContainer'
    );

    const emailElement = document.getElementById('loginEmail');
    const passwordElement = document.getElementById('loginPassword');

    const nativeButton = document.getElementById('loginButton-1');
    const signupRecaptchaButton = document.getElementById(
        'signupRecaptchaButton'
    );
    const forgotPassword = document.getElementById('forgotPassword');
    const loginRecaptchaButton = document.getElementById(
        'loginRecaptchaButton'
    );

    const verificationCodeInput = document.getElementById(
        'verificationCodeInput'
    );
    const verify2faButton = document.getElementById('verify2faButton');

    const verificationCodeStatus = document.getElementById(
        '2faVerificationCodeStatus'
    );

    _2faRecaptchaContainer.style.display = null;

    emailElement.disabled = true;
    passwordElement.disabled = true;

    nativeButton.style.display = 'none';
    signupRecaptchaButton.style.display = 'none';
    forgotPassword.style.display = 'none';
    loginRecaptchaButton.style.display = 'none';

    const recaptchaObject = await prepare2fa();

    const _2faMethods = await get2faMethods(error);
    let selectedIndex;

    if (_2faMethods.length === 1) selectedIndex = 0;
    else selectedIndex = await choose2faMethod(_2faMethods);

    if (!['success', 'successBefore'].includes(recaptchaObject.state))
        await wait2faRecaptchaSuccess(recaptchaObject);

    _2faRecaptchaContainer.style.display = 'none';

    verificationCodeInput.style.display = null;

    verify2faButton.style.opacity = 0;
    verify2faButton.style.display = null;

    verificationCodeStatus.innerText = 'Sending a verification code';
    verificationCodeStatus.style.display = null;

    const { phoneNumber, displayName } = await send2fa(selectedIndex);

    verificationCodeStatus.innerText =
        'A verification code has been sent to {location}'.replace(
            '{location}',
            displayName ? `${displayName} (${phoneNumber})` : phoneNumber
        );

    verify2faButton.addEventListener(
        'click',
        () => (verify2faButton.disabled = true)
    );
    verify2faButton.style.opacity = null;
}

window.verify2fa = async () => {
    if (!_2faError) throw new Error('No 2FA error found');

    const verify2faButton = document.getElementById('verify2faButton');
    const verificationCode = document.getElementById(
        'verificationCodeInput'
    ).value;

    try {
        await loginWith2fa(verificationCode);
    } catch (e) {
        const firebaseErrorCode = firebaseErrorCodes[e.code];
        return handleLoginError({
            errorCode: firebaseErrorCode?.errorCode,
            field: firebaseErrorCode?.field,
            error: e
        });
    } finally {
        verify2faButton.disabled = false;
    }
};

let loginRecaptcha;
window.doLogin = async (recaptchaScore) => {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const nativeButton = document.getElementById('loginButton-1');

    // create login captcha if user is likely a bot
    if (recaptchaScore < minimalLoginRecaptchaScore && !loginRecaptcha)
        loginRecaptcha = await createButton(
            document.getElementById('loginRecaptchaButton')
        );

    if (loginRecaptcha && loginRecaptcha.state !== 'success')
        return handleLoginError({
            errorCode: recaptchaStateNames[loginRecaptcha.state],
            field: 'recaptcha'
        });

    nativeButton.disabled = true;
    preventRedirect = true;
    try {
        window.removeLoginErrorFeedback();
        await loginWithEmail(email, password);
    } catch (e) {
        if (e.code === 'auth/multi-factor-auth-required') return enable2fa(e);

        const firebaseErrorCode = firebaseErrorCodes[e.code];
        return handleLoginError({
            errorCode: firebaseErrorCode?.errorCode,
            field: firebaseErrorCode?.field,
            error: e
        });
    } finally {
        nativeButton.disabled = false;
        preventRedirect = false;
    }

    redirect();
};

const signupFields = ['name', 'email', 'password', 'recaptcha'];
async function handleSignupError({ errorCode, field, error }) {
    const message =
        (await getErrorCodeMessages())[errorCode] ??
        errorCode ??
        (error?.message
            ? `Error: ${error.message}`
            : 'An unknown error occurred');

    if (!field) return coolAlert(message);

    if (!signupFields.includes(field))
        throw new Error(`Invalid field: ${field}`);

    for (const signupFieldId of signupFields) {
        const feedbackElement = document.getElementById(
            `signup-${signupFieldId}-feedback`
        );

        if (signupFieldId === field) feedbackElement.innerText = message;
        else feedbackElement.innerText = '';
    }
}
window.removeSignupErrorFeedback = () => {
    for (const signupFieldId of signupFields) {
        const feedbackElement = document.getElementById(
            `signup-${signupFieldId}-feedback`
        );
        feedbackElement.innerText = '';
    }
};

let signupRecaptcha;
window.doSignup = async (recaptchaScore) => {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const nativeButton = document.getElementById('signupButton-1');

    if (name.length === 0)
        return handleSignupError({ errorCode: 'noName', field: 'name' });

    // create login captcha if user is likely a bot
    if (recaptchaScore < minimalSignupRecaptchaScore && !signupRecaptcha)
        signupRecaptcha = await createButton(
            document.getElementById('signupRecaptchaButton')
        );

    if (signupRecaptcha && signupRecaptcha.state !== 'success')
        return handleSignupError({
            errorCode: recaptchaStateNames[loginRecaptcha.state],
            field: 'recaptcha'
        });

    nativeButton.disabled = true;
    preventRedirect = true;
    try {
        await createEmailAccount(email, password);
        await setDisplayName(name);
    } catch (e) {
        const firebaseErrorCode = firebaseErrorCodes[e.code];
        return handleSignupError({
            errorCode: firebaseErrorCode?.errorCode,
            field: firebaseErrorCode?.field,
            error: e
        });
    } finally {
        nativeButton.disabled = false;
        preventRedirect = false;
    }

    redirect();
};
