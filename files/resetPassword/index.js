import {
    login
} from '/sdk/auth.js';

import {
    sendPasswordResetEmail
} from '/sdk/login.js';

const emailInput = document.getElementById('emailInput');

window.sendResetEmail = async () => {
    if (emailInput.value === '') {
        return Toastify({
            text: 'Please enter your email address.',
            duration: 3000,
            gravity: 'top',
            position: 'center',
            backgroundColor: '#f44336',
        }).showToast();
    }

    try {
        sendPasswordResetEmail(emailInput.value);
        emailInput.value = '';
        Toastify({
            text: 'Password reset email sent! Please check your inbox.',
            duration: 3000,
            gravity: 'top',
            position: 'center',
            backgroundColor: '#4caf50',
            //when done, redirect to login page
            callback: () => {
                login();
            },
        }).showToast();
    } catch (error) {
        Toastify({
            text: 'An error occurred while sending the password reset email.',
            duration: 3000,
            gravity: 'top',
            position: 'center',
            backgroundColor: '#f44336',
        }).showToast();
    }
}

emailInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') //todo: use onSubmit
        window.sendResetEmail();

    //check if email is valid
    if (emailInput.value.includes('@') && emailInput.value.includes('.'))
        document
            .getElementById('sendResetEmailButton')
            .classList.remove('disabled');
    else
        document
            .getElementById('sendResetEmailButton')
            .classList.add('disabled');
});

document
    .getElementById('sendResetEmailButton')
    .addEventListener('mousedown', () => {
        if (
            document
                .getElementById('sendResetEmailButton')
                .classList.contains('disabled') === true
        )
            return Toastify({
                text: 'Please enter a valid email address.',
                duration: 3000,
                gravity: 'top',
                position: 'center',
                backgroundColor: '#f44336',
            }).showToast();
        else
            window.sendResetEmail();
    });
