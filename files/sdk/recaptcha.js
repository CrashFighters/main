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

window.googleCaptchaCallback = token => {
    console.log(token)
};

// hide recaptcha badge
const style = document.createElement('style');
style.innerHTML = `
.grecaptcha-badge { visibility: hidden; }
`;
document.head.appendChild(style);

const captchaButtons = [...document.getElementsByClassName('captchaButton')];
for (const captchaButton of captchaButtons) {
    const newCaptchaButton = document.createElement('button');
    newCaptchaButton.onclick = captchaButton.onclick;
    newCaptchaButton.innerText = captchaButton.innerText;

    newCaptchaButton.className = 'g-recaptcha';
    newCaptchaButton.dataset.sitekey = publicRecaptchaKey;
    newCaptchaButton.dataset.callback = 'googleCaptchaCallback';
    newCaptchaButton.dataset.action = 'submit';

    captchaButton.replaceWith(newCaptchaButton);
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