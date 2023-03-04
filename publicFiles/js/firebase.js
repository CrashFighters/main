/*

//todo: all fileRequirements are not always needed
//todo: move to sdk?

--fileRequirements--
/common/apiKeys.js

/js/performance.js
/js/appCheck.js
/js/analytics.js
/sdk/auth.js

--endFileRequirements--

*/

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js';
import { firebaseConfig } from '/common/apiKeys.js';

window.performance.mark('initFirebaseStart')

const init = {
    performance: undefined,
    appCheck: undefined,
    analytics: undefined,
    auth: undefined
};
const getHeaderFunctions = {
    appCheck: undefined
};
const values = {
    performance: undefined,
    appCheck: undefined,
    analytics: undefined,
    auth: undefined
};

const excludeScripts = document.querySelector('script[src="/js/firebase.js"]')?.dataset.excludeScripts?.split(' ') ?? [];

const scripts = [
    '/js/performance.js',
    '/js/appCheck.js',
    '/js/analytics.js',
    '/sdk/auth.js'
].filter(script => !excludeScripts.includes(script));

const app = initializeApp(firebaseConfig);

if (scripts.includes('/js/performance.js')) {
    if (!init.performance)
        ({ init: init.performance } = await import('/js/performance.js'));
    values.performance = await init.performance(app);
}

if (scripts.includes('/js/appCheck.js')) {
    if (!init.appCheck)
        ({ init: init.appCheck, _: { getAppCheckHeaders: getHeaderFunctions.appCheck } } = await import('/js/appCheck.js'));
    values.appCheck = await init.appCheck(app);
}

if (scripts.includes('/js/analytics.js')) {
    if (!init.analytics)
        ({ init: init.analytics } = await import('/js/analytics.js'));
    values.analytics = await init.analytics(app);
}

if (scripts.includes('/sdk/auth.js')) {
    if (!init.auth)
        ({ init: init.auth } = await import('/sdk/auth.js'));
    values.auth = await init.auth(app);
};

export const _ = {
    app,
    ...values
};

export const getHeaders = async () => {
    let headers = {};

    if (scripts.includes('/js/appCheck.js')) {
        headers = { ...headers, ...await getHeaderFunctions.appCheck() };
    }

    return headers;
}

window.performance.mark('initFirebaseEnd')
window.performance.measure('initFirebase', 'initFirebaseStart', 'initFirebaseEnd')