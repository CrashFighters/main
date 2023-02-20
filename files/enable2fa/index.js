import {
    enable
} from '/sdk/2fa.js';

const phoneNumberInput = document.getElementById('phoneNumber');
const displayNameInput = document.getElementById('displayName');

window.doEnable2fa = async () => {
    const phoneNumber = phoneNumberInput.value;
    const displayName = displayNameInput.value;

    const confirm = await enable(phoneNumber, displayName);
    window.confirm = confirm;
}