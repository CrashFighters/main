import {
    initializeAppCheck,
    ReCaptchaV3Provider
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-app-check.js';

import { publicRecaptchaKey } from '/common/apiKeys.js';

export async function initAppCheck(app) {
    const appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(publicRecaptchaKey),
        isTokenAutoRefreshEnabled: true
    });

    window._captcha = {
        firebase: {
            appCheck
        }
    }
};

// hide recaptcha badge
const style = document.createElement('style');
style.innerHTML = `
    .grecaptcha-badge { visibility: hidden; }
`;
document.head.appendChild(style);

function googleCaptchaCallback(id) {
    const element = document.getElementById(id);

    return async function (token) {
        const res = await fetch(`/api/recaptcha?token=${token}`);
        const score = parseInt(await res.text());

        window[element.dataset['score_callback']]?.(score);
    };
};

const captchaButtons = [...document.getElementsByClassName('captchaButton')];
for (const captchaButton of captchaButtons) {
    if (!captchaButton.id) {
        console.error('captchaButton must have an id attribute', captchaButton);
        continue;
    }

    const newCaptchaButton = document.createElement('button');
    newCaptchaButton.dataset['score_callback'] = captchaButton.dataset['score_callback'];
    newCaptchaButton.innerText = captchaButton.innerText;
    newCaptchaButton.id = captchaButton.id;

    newCaptchaButton.className = 'g-recaptcha';
    newCaptchaButton.dataset.sitekey = publicRecaptchaKey;
    newCaptchaButton.dataset.callback = `googleCaptchaCallback-${captchaButton.id}`;
    newCaptchaButton.dataset.action = 'submit';

    captchaButton.replaceWith(newCaptchaButton);
    window[`googleCaptchaCallback-${captchaButton.id}`] = googleCaptchaCallback(captchaButton.id);
}

if (!doesDocumentIncludeScript('https://www.google.com/recaptcha/api.js')) {
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js';
    document.head.appendChild(script);
}

function doesDocumentIncludeScript(url) {
    const scripts = [...document.getElementsByTagName('script')];
    return Boolean(scripts.find(script => script.src.endsWith(url)));
};