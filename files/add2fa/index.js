import {
    add
} from '/sdk/2fa.js';

const phoneNumberInput = document.getElementById('phoneNumber');
const displayNameInput = document.getElementById('displayName');
const enableButton = document.getElementById('enable2faButton');

const verificationCodeInput = document.getElementById('verificationCode');
const verifyButton = document.getElementById('verify2faButton');

let confirm;
window.doVerify2fa = async () => {
    if (!confirm)
        throw new Error('Must enable before verifying');

    verifyButton.disabled = true;
    await confirm(verificationCodeInput.value);
    confirm = null;
    enableButton.disabled = false;
}

window.doAdd2fa = async () => {
    const phoneNumber = phoneNumberInput.value;
    const displayName = displayNameInput.value;
    confirm = await add(phoneNumber, displayName);
    window.twoFactorAuth.readyForVerification = confirm;

}