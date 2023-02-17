const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');
const signUpButton_mobile = document.getElementById('signUp_mobile');
const signInButton_mobile = document.getElementById('signIn_mobile');


signUpButton.addEventListener('click', () => {
    container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
    container.classList.remove("right-panel-active");
});

signUpButton_mobile.addEventListener('click', () => {
    container.classList.add("right-panel-active");
});

signInButton_mobile.addEventListener('click', () => {
    container.classList.remove("right-panel-active");
});

function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    window.loginWithEmail(email, password);
}

function signup() {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    window.createEmailAccount(email, password);
}

		//on window.auth.user change
		window.auth.onStateChange((user) => {
			if (user) {
				// User is signed in, see docs for a list of available properties
				// https://firebase.google.com/docs/reference/js/firebase.User
				Toastify({

text: "Successfully Logged In!",

duration: 3000

}).showToast();
			} else {
				// User is signed out
				// ...
				Toastify({

text: "Please log in!",

duration: 3000

}).showToast();
			}
		});