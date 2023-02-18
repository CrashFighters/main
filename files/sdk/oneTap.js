import {
    GoogleAuthProvider,
    signInWithCredential
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js';

const { app, auth } = window.firebase;

window.googleSignInCallback = (a) => {
    signInWithCredential(auth, GoogleAuthProvider.credential(a.credential));
};

let loaded = false;
window.auth.onStateChange(() => {
    if (!loaded) {
        if (!window.auth.user)
            executeOneTap();

        loaded = true;

        window.googleTapHasRun = true;
    }
});

function executeOneTap() {
    if (document.getElementById('g_id_onload'))
        throw new Error('g_id_onload element already exists')
    else
        document.body.innerHTML += `
        <div id="g_id_onload"
            data-client_id="478395146629-5j6vcc7rv6atcfp62kgdvlnbbjo3aj7u.apps.googleusercontent.com"
            data-context="signin"
            data-callback="googleSignInCallback"
            data-close_on_tap_outside="false"
            data-itp_support="true">
        </div>
        `;

    if ((!doesDocumentIncludeScript('/sdk/googleLoginButtons') || (doesDocumentIncludeScript('/sdk/googleLoginButtons') && !window.googleLoginButtonsHasRun)))
        if (doesDocumentIncludeScript('https://accounts.google.com/gsi/client'))
            throw new Error('Google Sign In script already exists');
        else {
            let script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            document.head.appendChild(script);
        };
};

function doesDocumentIncludeScript(url) {
    const scripts = [...document.getElementsByTagName('script')];
    return Boolean(scripts.find(script => script.src.endsWith(url)));
};