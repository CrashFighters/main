/*

--fileRequirements--
/js/firebase.js
/sdk/language.js
--endFileRequirements--

*/

import {
    getAnalytics,
    logEvent as analyticsLogEvent,
    setUserProperties
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-analytics.js';

import { app } from '/js/firebase.js';

export const analytics = getAnalytics(app);

export function updateEffectiveLanguage(effectiveLanguage) {
    setUserProperties(analytics, { effectiveLanguage });
}

export function logEvent(name, params) {
    analyticsLogEvent(analytics, name, params);
}