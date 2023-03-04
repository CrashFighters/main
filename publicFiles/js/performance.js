import {
    getPerformance
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-performance.js';

export function init(app) {
    return getPerformance(app);
}