/*

--fetchPriority--: low

--fileRequirements--
/common/cookie.js
/common/apiKeys.js
/common/doesDocumentIncludeScript.js
/common/isMobile.js
/js/firebase.js
/js/analytics.js
--endFileRequirements--

*/

import {
    GoogleAuthProvider,
    signInWithCredential
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js';

import { getCookie, deleteCookie } from '/common/cookie.js';
import { googleSignInKey } from '/common/apiKeys.js';
import { doesDocumentIncludeScript } from '/common/doesDocumentIncludeScript.js';
import { isMobile } from '/common/isMobile.js';

const { auth } = (await import('/js/firebase.js'))._;
import { logEvent } from '/js/analytics.js';

window.googleButtonPopupCallback = async ({ credential }) => {
    await signInWithCredential(auth, GoogleAuthProvider.credential(credential));
    logEvent('login', { method: 'google', initiator: 'button', type: 'popup' });
};

const smallButtons = [...document.getElementsByClassName('smallGoogleLoginButton')];

for (const smallButton of smallButtons) {
    const newSmallButton = document.createElement('div');
    newSmallButton.className = 'g_id_signin';
    newSmallButton.dataset.type = 'icon';
    newSmallButton.dataset.shape = 'circle';
    newSmallButton.dataset.theme = 'outline';
    newSmallButton.dataset.text = 'signin_with';
    newSmallButton.dataset.size = 'large';

    smallButton.replaceWith(newSmallButton);
}

const bigButtons = [...document.getElementsByClassName('bigGoogleLoginButton')];

for (const bigButton of bigButtons) {
    const newBigButton = document.createElement('div');
    newBigButton.className = 'g_id_signin';
    newBigButton.dataset.type = 'standard';
    newBigButton.dataset.shape = 'pill';
    newBigButton.dataset.theme = 'outline';
    newBigButton.dataset.text = 'signin_with';
    newBigButton.dataset.size = 'large';
    newBigButton.dataset.logo_alignment = 'left';

    bigButton.replaceWith(newBigButton);
}

const documentIncludesGoogleTap = doesDocumentIncludeScript('/sdk/oneTap.js') || doesDocumentIncludeScript('/sdk/zeroTap.js');

const googleOnLoadDiv = document.createElement('div');
googleOnLoadDiv.id = 'g_id_onload';
googleOnLoadDiv.dataset.client_id = googleSignInKey;
googleOnLoadDiv.dataset.context = 'signin';
if (isMobile()) {
    googleOnLoadDiv.dataset.ux_mode = 'redirect';
    googleOnLoadDiv.dataset.login_uri = window.location.href
} else {
    googleOnLoadDiv.dataset.ux_mode = 'popup';
    googleOnLoadDiv.dataset.callback = 'googleButtonPopupCallback';
}
googleOnLoadDiv.dataset.auto_prompt = 'false';

if (!documentIncludesGoogleTap)
    if (document.getElementById('g_id_onload'))
        throw new Error('g_id_onload element already exists')
    else
        document.head.appendChild(googleOnLoadDiv);

if ((!documentIncludesGoogleTap) && ((!window.defaultGoogleClients) || window.defaultGoogleClients.length === 0))
    if (doesDocumentIncludeScript('https://accounts.google.com/gsi/client'))
        throw new Error('Google Sign In script already exists')
    else {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        document.head.appendChild(script);
    };

if (!window.defaultGoogleClients) window.defaultGoogleClients = [];
window.defaultGoogleClients.push('googleLoginButtons');

const googleSignInIdToken = getCookie('g_csrf_token');
if (googleSignInIdToken) {
    // user got redirected from login with Google redirect

    deleteCookie('g_csrf_token');

    const response = await fetch(`/api/getGoogleSignInCredential?token=${googleSignInIdToken}`);
    if (!response.ok) throw new Error('Failed to get Google Sign In credential')

    const credential = await response.text();

    await signInWithCredential(auth, GoogleAuthProvider.credential(credential));
    logEvent('login', { method: 'google', initiator: 'button', type: 'redirect' });
}