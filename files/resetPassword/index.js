const emailInput = document.getElementById('emailInput');

function sendResetEmail() {
    window.sendPasswordResetEmail(emailInput.value);
    alert('Reset email has been sent.')
}