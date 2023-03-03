const settings = require('../../../settings.json');
const requestInfo = require('../../../modules/requestInfo/getInfo').execute;
const parseCookie = require('../parse/cookie.js');

module.exports = {
    execute({ request } = {}) {
        const languages = getLanguages(request);
        let messages = {};

        for (const lang of languages) {
            const langMessages = getLangMessages(lang);
            messages = combineMessages(messages, langMessages);
        };

        return {
            languages,
            mainFunction: () => { return messages } //todo: rename mainFunction to messages
        }

    }
}

function combineMessages(oldMessages, newMessages) {
    const messages = Object.assign({}, oldMessages);

    for (const [key, newValue] of Object.entries(newMessages))
        if (messages[key] === undefined)
            messages[key] = newValue;
        else if (typeof newValue === 'object')
            messages[key] = combineMessages(newValue, newMessages[key]);
        else
            messages[key] = newValue;

    return messages;
}

function getLanguages(request) {
    if (!request) return getSupportedLanguages();

    let languages = [];

    if (request.headers.cookie && parseCookie(request.headers.cookie).language)
        languages.push(parseCookie(request.headers.cookie).language);

    languages.push(
        ...(requestInfo(request).lang?.map?.(({ name }) => name) ?? [])
    );

    languages.push(...getSupportedLanguages());

    languages = languages.filter(lang => getSupportedLanguages().includes(lang));
    languages = [...new Set(languages)].reverse();

    return languages;
}

// const firebase = require('firebase-admin');

// const { serviceAccount, databaseURL } = require('../../../credentials/firebase.json');

// firebase.initializeApp({
//     credential: firebase.credential.cert(serviceAccount),
//     databaseURL
// }, 'remote-config');

// firebase.remoteConfig().getTemplate().then(a => {
//     console.log(a)
//     process.exit()
// })

function getLangMessages(lang) {
    return require(`../../../messages/${lang}.json`);
}

function getSupportedLanguages() {
    return settings.generic.lang;
}