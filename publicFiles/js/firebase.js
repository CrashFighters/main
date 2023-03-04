/*

//todo: all fileRequirements are not always needed

--fileRequirements--
/common/apiKeys.js
/js/appCheck.js
/js/analytics.js
/sdk/auth.js
--endFileRequirements--

*/

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js';
import { firebaseConfig } from '/common/apiKeys.js';

let initAppCheck;
let initAnalytics;
let initAuth;

let getAppCheckHeaders;

const excludeScripts = document.querySelector('script[src="/js/firebase.js"]').dataset.excludeScripts?.split(' ') ?? [];

const scripts = [
    '/js/appCheck.js',
    '/js/analytics.js',
    '/sdk/auth.js'
].filter(script => !excludeScripts.includes(script));

const app = initializeApp(firebaseConfig);

if (scripts.includes('/js/appCheck.js')) {
    if (!initAppCheck)
        ({ init: initAppCheck, _: { getAppCheckHeaders } } = await import('/js/appCheck.js'));
    await initAppCheck(app);
}

if (scripts.includes('/js/analytics.js')) {
    if (!initAnalytics)
        ({ init: initAnalytics } = await import('/js/analytics.js'));
    await initAnalytics(app);
}

if (scripts.includes('/sdk/auth.js')) {
    if (!initAuth)
        ({ init: initAuth } = await import('/sdk/auth.js'));
    await initAuth(app);
};

export const _ = {
    app
};

export const getHeaders = async () => {
    let headers = {};

    if (scripts.includes('/js/appCheck.js')) {
        if (!getAppCheckHeaders)
            ({ init: initAppCheck, _: { getAppCheckHeaders } } = await import('/js/appCheck.js'));
        headers = { ...headers, ...await getAppCheckHeaders() };
    }

    return headers;
}