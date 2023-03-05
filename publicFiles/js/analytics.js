import {
    getAnalytics,
    logEvent as analyticsLogEvent
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-analytics.js';

let analytics;

export function init(app) {
    analytics = getAnalytics(app);
    return analytics;
}

export function logEvent(name, params) {
    analyticsLogEvent(analytics, name, params);
}