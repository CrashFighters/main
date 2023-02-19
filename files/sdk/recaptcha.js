import {
    initializeAppCheck,
    ReCaptchaV3Provider
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-app-check.js';

import {
    publicRecaptchaV3Key,
    publicRecaptchaV2Key
} from '/common/apiKeys.js';

const wait = ms => new Promise(res => setTimeout(res, ms));

async function getScoreFromV3Token(token) {
    const res = await fetch(`/api/recaptchaV3?token=${token}`);
    const score = parseFloat(await res.text());

    return score;
};

function waitReady() {
    return new Promise(res => {
        grecaptcha.ready(res);
    });
};

window._recaptcha = {
    initAppCheck: async function (app) {
        const appCheck = initializeAppCheck(app, {
            provider: new ReCaptchaV3Provider(publicRecaptchaV3Key),
            isTokenAutoRefreshEnabled: true
        });

        window._captcha = {
            firebase: {
                appCheck
            }
        }
    }
};

export async function getScore(action = 'SDK_execute') {
    await waitReady();
    const token = await grecaptcha.execute(publicRecaptchaV3Key, { action });
    const score = await getScoreFromV3Token(token);

    return score;
}

function renderV2Button(element) {
    return new Promise((res, rej) => {
        grecaptcha.render(element, {
            sitekey: publicRecaptchaV2Key,
            callback: res,
            'expired-callback': rej,
            'error-callback': rej
        });
    });
}

export async function verifyViaButton(element) {
    await waitReady();
    await renderV2Button(element, action);
}

// hide recaptcha badge
const style = document.createElement('style');
style.innerHTML = `
    .grecaptcha-badge { visibility: hidden; }
`;
document.head.appendChild(style);

function googleCaptchaV3Callback(id) {
    return async function (token) {
        const element = document.getElementById(id);
        const score = await getScoreFromV3Token(token);

        await wait(100)

        element.style.cursor = null;
        element.classList.remove('disabled');
        window[element.dataset['recaptcha_callback']]?.(score);
    };
};

const invisRecaptchaButtons = [...document.getElementsByClassName('invisRecaptchaButton')];
for (const invisRecaptchaButton of invisRecaptchaButtons) {
    if (!invisRecaptchaButton.id) {
        console.error('captchaButton must have an id attribute', invisRecaptchaButton);
        continue;
    }

    const newInvisCaptchaButton = document.createElement('button');

    newInvisCaptchaButton.innerText = invisRecaptchaButton.innerText;
    newInvisCaptchaButton.id = invisRecaptchaButton.id;
    newInvisCaptchaButton.dataset['recaptcha_callback'] = invisRecaptchaButton.dataset['recaptcha_callback'];

    newInvisCaptchaButton.dataset.action = invisRecaptchaButton.dataset['recaptcha_action'] ?? 'SDK_invisButton';
    newInvisCaptchaButton.dataset.callback = `googleCaptchaV3Callback-${invisRecaptchaButton.id}`;
    window[`googleCaptchaV3Callback-${invisRecaptchaButton.id}`] = googleCaptchaV3Callback(invisRecaptchaButton.id);

    newInvisCaptchaButton.addEventListener('click', () => {
        newInvisCaptchaButton.style.cursor = 'wait';
        newInvisCaptchaButton.classList.add('disabled');
    });
    newInvisCaptchaButton.className = 'g-recaptcha';
    newInvisCaptchaButton.dataset.sitekey = publicRecaptchaV3Key;

    invisRecaptchaButton.replaceWith(newInvisCaptchaButton);
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