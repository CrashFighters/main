/*

--fileRequirements--
/common/apiKeys.js
--endFileRequirements--

*/

import {
    initializeAppCheck,
    ReCaptchaV3Provider
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-app-check.js';

import {
    publicRecaptchaV3Key
} from '/common/apiKeys.js';

export let appCheck;

export async function init(app) {
    await initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(publicRecaptchaV3Key),
        isTokenAutoRefreshEnabled: true
    });
}
