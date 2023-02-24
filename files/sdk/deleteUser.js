import { revokeGoogleTokenKey } from '/common/apiKeys.js';
import { doesDocumentIncludeScript } from '/common/doesDocumentIncludeScript.js';

const { getAuthHeaders } = (await import('/sdk/auth.js'))._;

function revoke() {
    return new Promise((res, rej) => {
        google.accounts.id.revoke('user@google.com', resp => {
            if (resp.success)
                res()
            else
                rej(new Error(resp.error))
        });
    })
}

export const deleteAccount = async () => {
    if (!window.auth.user)
        throw new Error('User is not logged in')

    if (window.auth.user.loginMethod === 'google')
        await revoke();

    console.warn('DEBUG: deleteAccount has been called, but only revoking Google token for now')
    // await fetch('/api/deleteUser', {
    //     headers: {
    //         ...await getAuthHeaders()
    //     }
    // });
}

window.c = deleteAccount; //todo: remove

const documentIncludesGoogleTap = doesDocumentIncludeScript('/sdk/oneTap.js') || doesDocumentIncludeScript('/sdk/zeroTap.js');

const googleOnLoadDiv = document.createElement('div');
googleOnLoadDiv.id = 'g_id_onload';
googleOnLoadDiv.dataset.client_id = revokeGoogleTokenKey;
googleOnLoadDiv.dataset.context = 'signin';
if (window.innerWidth > window.innerHeight) {
    googleOnLoadDiv.dataset.ux_mode = 'popup';
    googleOnLoadDiv.dataset.callback = 'googleSignInCallback';
} else {
    googleOnLoadDiv.dataset.ux_mode = 'redirect';
    googleOnLoadDiv.dataset.login_uri = window.location.href;
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
window.defaultGoogleClients.push('deleteUser');