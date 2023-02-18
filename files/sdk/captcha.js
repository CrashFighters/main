import {
    initializeAppCheck,
    ReCaptchaV3Provider
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-app-check.js';

export async function initAppCheck(app) {
    const appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider('6LfA2JIkAAAAAGWMmTI-5OR1Hmj7vKORFHV4aXIj'),
        isTokenAutoRefreshEnabled: true
    });

    window._captcha = {
        firebase: {
            appCheck
        }
    }
}

export async function initRecaptcha() {
    if (!doesDocumentIncludeScript('https://www.google.com/recaptcha/api.js')) {
        const script = document.createElement('script');
        script.src = 'https://www.google.com/recaptcha/api.js';
        document.head.appendChild(script);
    }

    //todo: add html elements
}

function doesDocumentIncludeScript(url) {
    const scripts = [...document.getElementsByTagName('script')];
    return Boolean(scripts.find(script => script.src.endsWith(url)));
};