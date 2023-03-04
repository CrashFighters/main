/*

--fileRequirements--
/common/apiKeys.js
--endFileRequirements--

*/

import {
    initializeAppCheck,
    ReCaptchaV3Provider,
    getToken
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-app-check.js';

import {
    publicRecaptchaV3Key
} from '/common/apiKeys.js';

let appCheck;

export async function init(app) {
    appCheck = await initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(publicRecaptchaV3Key),
        isTokenAutoRefreshEnabled: true
    });
    return appCheck;
}

export const _ = {
    getAppCheckHeaders: async () => ({
        'X-Firebase-AppCheck': (await getToken(appCheck, false)).token
    })
}
