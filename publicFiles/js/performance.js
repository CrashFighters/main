import {
    getPerformance,
    trace
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-performance.js';

let performance;
export function init(app) {
    performance = getPerformance(app);
    return performance;
}

const traces = {};
export function startTrace(name) {
    const t = trace(performance, name);
    traces[name] = t;

    t.start();
}

export function stopTrace(name) {
    const t = traces[name];
    if (!t) throw new Error(`No trace found with name ${name}`)

    t.stop();
    delete traces[name];
}