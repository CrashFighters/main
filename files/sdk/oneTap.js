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
    if (!loaded && !window.auth.user)
        executeOneTap();

    loaded = true;
});

function executeOneTap() {
    if (document.getElementById('g_id_onload'))
        throw new Error('g_id_onload element already exists. Please follow the correct import order.')
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

    if (!hasScriptLoaded('https://accounts.google.com/gsi/client')) {
        let script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        document.head.appendChild(script);
    };
};

function hasScriptLoaded(url) {
    const scripts = [...document.getElementsByTagName('script')];
    return Boolean(scripts.find(script => script.src === url));
};