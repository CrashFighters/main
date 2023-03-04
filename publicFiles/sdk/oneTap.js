/*

--fetchPriority--: low

--fileRequirements--
/common/apiKeys.js
/common/doesDocumentIncludeScript.js
/js/firebase.js
/sdk/auth.js
/js/analytics.js
--endFileRequirements--

*/

import {
    GoogleAuthProvider,
    signInWithCredential
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js';

import { googleSignInKey } from '/common/apiKeys.js';
import { doesDocumentIncludeScript } from '/common/doesDocumentIncludeScript.js';

import { auth } from '/js/firebase.js';
import { onStateChange } from '/sdk/auth.js';
import { logEvent } from '/js/analytics.js';

window.googleOneTapCallback = async ({ credential }) => {
    await signInWithCredential(auth, GoogleAuthProvider.credential(credential));
    logEvent('login', { method: 'google', initiator: 'oneTap', type: 'embedded' })
};

const googleOnLoadDiv = document.createElement('div');
googleOnLoadDiv.id = 'g_id_onload';
googleOnLoadDiv.dataset.client_id = googleSignInKey;
googleOnLoadDiv.dataset.context = 'signin';
googleOnLoadDiv.dataset.callback = 'googleOneTapCallback';
googleOnLoadDiv.dataset.close_on_tap_outside = 'false';
googleOnLoadDiv.dataset.itp_support = 'true';

let loaded = false;
onStateChange(user => {
    if (!loaded) {
        if (user) {
            googleOnLoadDiv.dataset.auto_prompt = 'false';
            addGoogleScript();
        } else
            executeOneTap();

        loaded = true;

        window.googleTapHasRun = true;
    }
});

function executeOneTap() {
    if (document.getElementById('g_id_onload'))
        throw new Error('g_id_onload element already exists')
    else
        document.body.appendChild(googleOnLoadDiv);

    addGoogleScript();
};

function addGoogleScript() {
    if (doesDocumentIncludeScript('https://accounts.google.com/gsi/client'))
        throw new Error('Google Sign In script already exists');
    else {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        document.head.appendChild(script);
    };
};