import {
    GoogleAuthProvider,
    signInWithCredential
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js';

import {
    onStateChange
} from '/sdk/auth.js';

import { googleSignInKey } from '/common/apiKeys.js';
import { doesDocumentIncludeScript } from '/common/doesDocumentIncludeScript.js';

const { auth } = (await import('/sdk/auth.js'))._.firebase;

window.googleSignInCallback = (a) => {
    signInWithCredential(auth, GoogleAuthProvider.credential(a.credential));
};

let loaded = false;
onStateChange(user => {
    if (!loaded) {
        if (!user)
            executeOneTap();

        loaded = true;

        window.googleTapHasRun = true;
    }
});

const googleOnLoadDiv = document.createElement('div');
googleOnLoadDiv.id = 'g_id_onload';
googleOnLoadDiv.dataset.client_id = googleSignInKey;
googleOnLoadDiv.dataset.context = 'signin';
googleOnLoadDiv.dataset.callback = 'googleSignInCallback';
googleOnLoadDiv.dataset.close_on_tap_outside = 'false';
googleOnLoadDiv.dataset.itp_support = 'true';

function executeOneTap() {
    if (document.getElementById('g_id_onload'))
        throw new Error('g_id_onload element already exists')
    else
        document.body.appendChild(googleOnLoadDiv);

    if (!window.defaultGoogleClients || window.defaultGoogleClients.length === 0)
        if (doesDocumentIncludeScript('https://accounts.google.com/gsi/client'))
            throw new Error('Google Sign In script already exists');
        else {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            document.head.appendChild(script);
        };
};