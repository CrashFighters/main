/*

--fileRequirements--
/js/firebase.js
/sdk/language.js
/sdk/auth.js
/common/getHeaders.js
/api/getUserRoles
--endFileRequirements--

*/

import {
    getAnalytics,
    logEvent as analyticsLogEvent,
    setUserProperties
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-analytics.js';

import { app } from '/js/firebase.js';
import { getHeaders } from '/common/getHeaders.js';

export const analytics = getAnalytics(app);

export function updateEffectiveLanguage(effectiveLanguage) {
    setUserProperties(analytics, { effectiveLanguage });
}

export function logEvent(name, params) {
    analyticsLogEvent(analytics, name, params);
}

function updateUserRoles(userRoles) {
    setUserProperties(analytics, { userRoles: userRoles.join(' ') });
}

(async () => { //to avoid import loops

    const { onStateChange } = await import('/sdk/auth.js');

    onStateChange(async () => {
        const response = await fetch('/api/getUserRoles', {
            headers: {
                ...await getHeaders()
            }
        });

        if (!response.ok)
            throw new Error(`${response.status} ${response.statusText}`);

        updateUserRoles(await response.json());
    });

})();