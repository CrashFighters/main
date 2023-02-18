window.auth.onStateChange(user => {
    const email = document.getElementById('email');

    if (user)
        email.innerText = user.email;
    else
        email.innerText = 'Not logged in';
})