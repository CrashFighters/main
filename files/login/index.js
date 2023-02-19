const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');
const signUpButton_mobile = document.getElementById('signUp_mobile');
const signInButton_mobile = document.getElementById('signIn_mobile');

//remove old listeners
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

import {
    onStateChange
} from '/sdk/auth.js';

import {
    loginWithEmail,
    createEmailAccount
} from '/sdk/login.js';

import {
    setDisplayName
} from '/sdk/settings.js';

import {
    minimalLoginRecaptchaScore,
    minimalSignupRecaptchaScore
} from '/common/settings.js';

import {
    createButton
} from '/sdk/recaptcha.js';

let preventRedirect = false;
onStateChange(user => {
    if (user && !preventRedirect)
        window.location.replace('/');
});

const firebaseErrorCodes = {
    'auth/user-not-found': {
        errorCode: 'emailDoesNotExist',
        field: 'email'
    },
    'auth/invalid-email': {
        errorCode: 'invalidEmail',
        field: 'email'
    },
    'auth/wrong-password': {
        errorCode: 'wrongPassword',
        field: 'password'
    },
    'auth/weak-password': {
        errorCode: 'weakPassword',
        field: 'password'
    }
};

const errorCodeMessages = {
    emailDoesNotExist: 'There is no account associated with this email address',
    invalidEmail: "This isn't a valid email address",
    wrongPassword: 'The password you entered is incorrect',
    weakPassword: 'The password you entered is too weak',
    recaptchaNotSolved: 'Please solve the captcha'
}

const loginFields = [
    'email',
    'password',
    'recaptcha'
];
function handleLoginError({ errorCode, field, error }) {
    if (!field)
        throw new Error('Not implemented'); //todo: use Toastify?

    if (!loginFields.includes(field))
        throw new Error(`Invalid field: ${field}`)

    const message = errorCodeMessages[errorCode] ?? errorCode ?? error?.message ?? 'An unknown error occurred';

    for (const loginFieldId of loginFields) {
        const feedbackElement = document.getElementById(`login-${loginFieldId}-feedback`);

        console.log(feedbackElement)

        if (loginFieldId === field)
            feedbackElement.innerText = message;
        else
            feedbackElement.innerText = '';
    }

};

let loginRecaptcha;
window.doLogin = async (recaptchaScore) => {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const nativeButton = document.getElementById('loginButton-1');

    // create login captcha if user is likely a bot
    if (recaptchaScore < minimalLoginRecaptchaScore && !loginRecaptcha)
        loginRecaptcha = await createButton(document.getElementById('loginRecaptchaButton'));

    if ((loginRecaptcha && loginRecaptcha.state !== 'success'))
        return handleLoginError({ errorCode: 'recaptchaNotSolved', field: 'recaptcha' });

    nativeButton.disabled = true;
    preventRedirect = true;
    try {
        await loginWithEmail(email, password);
    } catch (e) {
        let firebaseErrorCode = firebaseErrorCodes[e.code];
        return handleLoginError({ errorCode: firebaseErrorCode?.errorCode, field: firebaseErrorCode?.field, error: e });

    } finally {
        nativeButton.disabled = false;
        preventRedirect = false;
    }

    window.location.replace('/');
}

let signupRecaptcha;
window.doSignup = async (recaptchaScore) => {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const nativeButton = document.getElementById('signupButton-1');

    // create login captcha if user is likely a bot
    if (recaptchaScore < minimalSignupRecaptchaScore && !signupRecaptcha)
        signupRecaptcha = await createButton(document.getElementById('signupRecaptchaButton'));

    if ((signupRecaptcha && signupRecaptcha.state !== 'success') || (!signupRecaptcha && recaptchaScore < minimalSignupRecaptchaScore))
        return;

    nativeButton.disabled = true;
    preventRedirect = true;
    try {
        await createEmailAccount(email, password);
        await setDisplayName(name);
    } catch (e) {
        throw e; //todo: add same error handling as login
    } finally {
        nativeButton.disabled = false;
        preventRedirect = false;
    }

    window.location.replace('/');
}
