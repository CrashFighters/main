import {
    getAnalytics,
    logEvent as analyticsLogEvent
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-analytics.js';

let getEffectiveLanguage;
let analytics;

export function init(app) {
    analytics = getAnalytics(app);
    return analytics;
}

export async function logEvent(name, params) {
    if (!getEffectiveLanguage)
        ({ getEffectiveLanguage } = await import('/sdk/language.js'));

    analyticsLogEvent(analytics, name, {
        effectiveLanguage: getEffectiveLanguage(), // todo: change to user property
        ...params
    });
}