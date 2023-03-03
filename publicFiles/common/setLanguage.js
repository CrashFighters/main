/*

--fileRequirements--
/common/cookie.js
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

import { onStateChange } from '/sdk/auth.js';
const { auth } = (await import('/sdk/auth.js'))._.firebase;

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
        //todo: get browser language if language is undefined, use Navigator.languages ?
        // https://developer.mozilla.org/en-US/docs/Web/API/Navigator/languages
        (await import('/sdk/language.js'))._.execute(false, language);
}