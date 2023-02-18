import {
    GoogleAuthProvider,
    signInWithCredential
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js';

const { app, auth } = (await import('/sdk/auth.js')).default.firebase;

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

const googleOnLoadDiv = document.createElement('div');
googleOnLoadDiv.id = 'g_id_onload';
googleOnLoadDiv.dataset.client_id = '478395146629-5j6vcc7rv6atcfp62kgdvlnbbjo3aj7u.apps.googleusercontent.com';
googleOnLoadDiv.dataset.context = 'signin';
googleOnLoadDiv.dataset.callback = 'googleSignInCallback';
googleOnLoadDiv.dataset.close_on_tap_outside = 'false';
googleOnLoadDiv.dataset.itp_support = 'true';

function executeOneTap() {
    if (document.getElementById('g_id_onload'))
        throw new Error('g_id_onload element already exists')
    else
        document.body.appendChild(googleOnLoadDiv);

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