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

let preventRedirect = false;
onStateChange(user => {
    if (user && !preventRedirect)
        window.location.replace('/');
});

window.doLogin = async () => {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    preventRedirect = true;
    await window.login.loginWithEmail(email, password);

    window.location.replace('/');
}

window.doSignup = async () => {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    preventRedirect = true;
    await window.login.createEmailAccount(email, password);
    await window.settings.setDisplayName(name);

    window.location.replace('/');
}