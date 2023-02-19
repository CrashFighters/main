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

window.doLogin = async (recaptchaScore) => {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (recaptchaScore < minimalLoginRecaptchaScore)
        // will throw if captcha fails
        await verifyViaButton(document.getElementById('loginRecaptchaButton'));

    preventRedirect = true;
    await loginWithEmail(email, password);

    window.location.replace('/');
}

window.doSignup = async (recaptchaScore) => {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    if (recaptchaScore < minimalSignupRecaptchaScore)
        // will throw if captcha fails
        await verifyViaButton(document.getElementById('signupRecaptchaButton'));

    preventRedirect = true;
    await createEmailAccount(email, password);
    await setDisplayName(name);

    window.location.replace('/');
}