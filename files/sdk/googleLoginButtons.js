import {
    GoogleAuthProvider,
    signInWithCredential
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js';

const { app, auth } = window.firebase;

window.googleSignInCallback = (a) => {
    signInWithCredential(auth, GoogleAuthProvider.credential(a.credential));
};

const smallButtons = [...document.getElementsByClassName('smallGoogleLoginButton')];
const newSmallButton = document.createElement('div');
newSmallButton.className = 'g_id_signin';
newSmallButton.dataset.type = 'icon';
newSmallButton.dataset.shape = 'circle';
newSmallButton.dataset.theme = 'outline';
newSmallButton.dataset.text = 'signin_with';
newSmallButton.dataset.size = 'large';

for (const smallButton of smallButtons)
    smallButton.replaceWith(newSmallButton);

const bigButtons = [...document.getElementsByClassName('bigGoogleLoginButton')];
const newBigButton = document.createElement('div');
newBigButton.className = 'g_id_signin';
newBigButton.dataset.type = 'standard';
newBigButton.dataset.shape = 'pill';
newBigButton.dataset.theme = 'outline';
newBigButton.dataset.text = 'signin_with';
newBigButton.dataset.size = 'large';
newBigButton.dataset.logo_alignment = 'left';

for (const bigButton of bigButtons) {
    console.log('Replacing', bigButton, 'with', newBigButton)
    bigButton.replaceWith(newBigButton);
}

const documentIncludesGoogleTap = doesDocumentIncludeScript('/sdk/oneTap.js') || doesDocumentIncludeScript('/sdk/zeroTap.js');

if (!documentIncludesGoogleTap)
    if (document.getElementById('g_id_onload'))
        throw new Error('g_id_onload element already exists')
    else
        document.head.innerHTML += `
        <div id="g_id_onload"
            data-client_id="478395146629-9g1so59tp8p4iqn61g3iruksa99rmk0l.apps.googleusercontent.com"
            data-context="signin"
            data-ux_mode="popup"
            data-callback="googleSignInCallback"
            data-auto_prompt="false">
        </div>
        `;

if ((!documentIncludesGoogleTap) || (documentIncludesGoogleTap && window.googleTapHasRun))
    if (doesDocumentIncludeScript('https://accounts.google.com/gsi/client'))
        throw new Error('Google Sign In script already exists')
    else {
        let script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        document.head.appendChild(script);
    };

function doesDocumentIncludeScript(url) {
    const scripts = [...document.getElementsByTagName('script')];
    return Boolean(scripts.find(script => script.src.endsWith(url)));
};

window.googleLoginButtonsHasRun = true;