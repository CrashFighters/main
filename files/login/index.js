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
    awaitButtonSuccess
} from '/sdk/recaptcha.js';

let preventRedirect = false;
onStateChange(user => {
    if (user && !preventRedirect)
        window.location.replace('/');
});

window.doLogin = async (recaptchaScore) => {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const button = document.getElementById('loginButton-1');

    if (recaptchaScore < minimalLoginRecaptchaScore) {
        button.disabled = true;

        try {
            await awaitButtonSuccess(document.getElementById('loginRecaptchaButton'));
        } catch (e) {
            button.disabled = false;
            throw e;
        }
    }

    preventRedirect = true;
    await loginWithEmail(email, password);

    button.disabled = false;
    window.location.replace('/');
}

window.doSignup = async (recaptchaScore) => {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const button = document.getElementById('signupButton-1');

    if (recaptchaScore < minimalSignupRecaptchaScore) {
        button.disabled = true;

        try {
            await awaitButtonSuccess(document.getElementById('signupRecaptchaButton'));
        } catch (e) {
            button.disabled = false;
            throw e;
        }
    }

    preventRedirect = true;
    await createEmailAccount(email, password);
    await setDisplayName(name);

    button.disabled = false;
    window.location.replace('/');
}