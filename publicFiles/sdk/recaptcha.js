/*

--fileRequirements--
/common/apiKeys.js
/common/doesDocumentIncludeScript.js
--endFileRequirements--

*/

import {
    publicRecaptchaV3Key,
    publicRecaptchaV2Key
} from '/common/apiKeys.js';
import { doesDocumentIncludeScript } from '/common/doesDocumentIncludeScript.js';

async function getScoreFromV3Token(token) {
    const res = await fetch(`/api/recaptchaV3?token=${token}`);
    const score = parseFloat(await res.text());

    return score;
};

async function checkSuccessFromV2Token(token) {
    try {
        const res = await fetch(`/api/recaptchaV2?token=${token}`);
        const success = await res.json();

        return success;
    } catch (e) {
        console.error(e);
        return false;
    }
}

function waitReady() {
    return new Promise(res => {
        grecaptcha.ready(res);
    });
};

export async function getScore(action = 'SDK_execute') {
    await waitReady();
    const token = await grecaptcha.execute(publicRecaptchaV3Key, { action });
    const score = await getScoreFromV3Token(token);

    return score;
}

function renderV2Button(element) {
    const callbacks = [];
    const button = {
        state: 'ready',
        onStateChange: cb => {
            callbacks.push(cb);
        }
    };

    const setState = state => {
        button.state = state;
        for (const cb of callbacks)
            cb(button);
    };

    grecaptcha.render(element, {
        sitekey: publicRecaptchaV2Key,
        callback: async token => {
            if (await checkSuccessFromV2Token(token))
                setState('success')
            else
                setState('error')
        },
        'error-callback': () => {
            setState('error')
        },
        'expired-callback': () => {
            setState('expired')
        }
    });

    return button;
}

export async function createButton(element) {
    if (!element)
        throw new Error('No element provided to createButton')

    await waitReady();
    const button = renderV2Button(element);

    return button;
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
        if (element.dataset['recaptcha_loading_class'])
            element.classList.add(element.dataset['recaptcha_loading_class']);

        const score = await getScoreFromV3Token(token);

        window[element.dataset['recaptcha_callback']]?.(score);

        if (element.dataset['recaptcha_loading_class'])
            element.classList.remove(element.dataset['recaptcha_loading_class']);
    };
};

const invisRecaptchaButtons = [...document.getElementsByClassName('invisRecaptchaButton')];
for (const invisRecaptchaButton of invisRecaptchaButtons) {
    if (!invisRecaptchaButton.id) {
        console.error('captchaButton must have an id attribute', invisRecaptchaButton);
        continue;
    }

    const newInvisCaptchaButton = document.createElement('button');

    for (const key of Object.keys(invisRecaptchaButton.dataset))
        newInvisCaptchaButton.dataset[key] = invisRecaptchaButton.dataset[key];

    newInvisCaptchaButton.innerText = invisRecaptchaButton.innerText;
    newInvisCaptchaButton.id = invisRecaptchaButton.id;
    newInvisCaptchaButton.dataset['recaptcha_callback'] = invisRecaptchaButton.dataset['recaptcha_callback'];
    newInvisCaptchaButton.dataset['recaptcha_loading_class'] = invisRecaptchaButton.dataset['recaptcha_loading_class'];

    newInvisCaptchaButton.dataset.action = invisRecaptchaButton.dataset['recaptcha_action'] ?? 'SDK_invisButton';
    newInvisCaptchaButton.dataset.callback = `googleCaptchaV3Callback-${invisRecaptchaButton.id}`;
    window[`googleCaptchaV3Callback-${invisRecaptchaButton.id}`] = googleCaptchaV3Callback(invisRecaptchaButton.id);

    newInvisCaptchaButton.className = 'g-recaptcha';
    newInvisCaptchaButton.dataset.sitekey = publicRecaptchaV3Key;

    invisRecaptchaButton.replaceWith(newInvisCaptchaButton);
}

if (!doesDocumentIncludeScript('https://www.google.com/recaptcha/api.js')) {
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${publicRecaptchaV3Key}`;
    document.head.appendChild(script);
}