const signUpButton = document.getElementById("signUp");
const signInButton = document.getElementById("signIn");
const container = document.getElementById("container");
const signUpButton_mobile = document.getElementById("signUp_mobile");
const signInButton_mobile = document.getElementById("signIn_mobile");

//remove old listeners
signUpButton.removeEventListener("click", () => {
    container.classList.add("right-panel-active");
});
signInButton.removeEventListener("click", () => {
    container.classList.remove("right-panel-active");
});
signUpButton_mobile.removeEventListener("click", () => {
    container.classList.add("right-panel-active");
});
signInButton_mobile.removeEventListener("click", () => {
    container.classList.remove("right-panel-active");
});

signUpButton.addEventListener("click", () => {
    container.classList.add("right-panel-active");
});

signInButton.addEventListener("click", () => {
    container.classList.remove("right-panel-active");
});

signUpButton_mobile.addEventListener("click", () => {
    container.classList.add("right-panel-active");
});

signInButton_mobile.addEventListener("click", () => {
    container.classList.remove("right-panel-active");
});

function doLogin() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    window.login.loginWithEmail(email, password);
}

function signup() {
    const name = document.getElementById("signupName").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;

    window.login.createEmailAccount(email, password);
}

window.auth.onStateChange(() => {
    if (window.auth.user) window.location.replace("/");
});