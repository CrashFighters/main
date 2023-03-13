/*

--fileRequirements--
/firebase/firebase-analytics.js
/js/firebase.js
/sdk/language.js
--endFileRequirements--

*/

import {
    getAnalytics,
    logEvent as analyticsLogEvent
} from '/firebase/firebase-analytics.js';

import { app } from '/js/firebase.js';
import { getEffectiveLanguage } from '/sdk/language.js';

export const analytics = getAnalytics(app);

export function logEvent(name, params) {
    analyticsLogEvent(analytics, name, {
        effectiveLanguage: getEffectiveLanguage(), // todo: change to user property
        ...params
    });
}