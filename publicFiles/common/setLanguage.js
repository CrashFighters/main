/*

--fileRequirements--
/common/cookie.js
/js/firebase.js
/sdk/auth.js
--endFileRequirements--

*/

import {
    useDeviceLanguage
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js';

import {
    getCookie,
    setCookie,
    deleteCookie
} from '/common/cookie.js';

import { auth } from '/js/firebase.js';
import { onStateChange } from '/sdk/auth.js';

let first = true;
onStateChange(() => {
    if (!first) return;

    const language = getCookie('language');
    if (language)
        auth.languageCode = language;
    else
        useDeviceLanguage(auth);

    first = false;
});

let doesDocumentIncludeScript;
export async function setLanguage(language) {
    if (!language) {
        deleteCookie('language');
        useDeviceLanguage(auth);
    } else {
        setCookie('language', language);
        auth.languageCode = language;
    }

    if (!doesDocumentIncludeScript)
        ({ doesDocumentIncludeScript } = await import('/common/doesDocumentIncludeScript.js'));

    if (doesDocumentIncludeScript('/sdk/language.js'))
        (await import('/sdk/language.js'))._.execute(false, language);
}