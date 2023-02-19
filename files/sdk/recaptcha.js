import {
    initializeAppCheck,
    ReCaptchaV3Provider
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-app-check.js';

import { publicRecaptchaV3Key } from '/common/apiKeys.js';

const wait = ms => new Promise(res => setTimeout(res, ms));

async function getScoreFromToken(token) {
    const res = await fetch(`/api/recaptchaV3?token=${token}`);
    const score = parseFloat(await res.text());

    return score;
};

function waitReady() {
    return new Promise(res => {
        grecaptcha.ready(res);
    });
};

export async function initAppCheck(app) {
    const appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(publicRecaptchaV3Key),
        isTokenAutoRefreshEnabled: true
    });

    window._captcha = {
        firebase: {
            appCheck
        }
    }
};

export async function execute(action = 'SDK-execute') {
    await waitReady();
    const token = await grecaptcha.execute(publicRecaptchaV3Key, { action });
    const score = await getScoreFromToken(token);

    return score;
}

window.captchaExecute = execute;

// hide recaptcha badge
const style = document.createElement('style');
style.innerHTML = `
    .grecaptcha-badge { visibility: hidden; }
`;
document.head.appendChild(style);

function googleCaptchaCallback(id) {
    return async function (token) {
        const element = document.getElementById(id);
        const score = await getScoreFromToken(token);

        await wait(100)

        element.style.cursor = null;
        element.classList.remove('disabled');
        window[element.dataset['recaptcha_callback']]?.(score);
    };
};

const invisRecaptchaButtons = [...document.getElementsByClassName('invisRecaptchaButton')];
for (const captchaButton of invisRecaptchaButtons) {
    if (!captchaButton.id) {
        console.error('captchaButton must have an id attribute', captchaButton);
        continue;
    }

    const newCaptchaButton = document.createElement('button');
    newCaptchaButton.dataset['recaptcha_callback'] = captchaButton.dataset['recaptcha_callback'];
    newCaptchaButton.innerText = captchaButton.innerText;
    newCaptchaButton.id = captchaButton.id;
    newCaptchaButton.dataset.action = captchaButton.dataset.action ?? 'SDK-button';

    newCaptchaButton.addEventListener('click', () => {
        newCaptchaButton.style.cursor = 'wait';
        newCaptchaButton.classList.add('disabled');
    });
    newCaptchaButton.dataset.callback = `googleCaptchaCallback-${captchaButton.id}`;
    window[`googleCaptchaCallback-${captchaButton.id}`] = googleCaptchaCallback(captchaButton.id);
    newCaptchaButton.className = 'g-recaptcha';
    newCaptchaButton.dataset.sitekey = publicRecaptchaV3Key;

    captchaButton.replaceWith(newCaptchaButton);
}

if (!doesDocumentIncludeScript('https://www.google.com/recaptcha/api.js')) {
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${publicRecaptchaV3Key}`;
    document.head.appendChild(script);
}

function doesDocumentIncludeScript(url) {
    const scripts = [...document.getElementsByTagName('script')];
    return Boolean(scripts.find(script => script.src.endsWith(url)));
};