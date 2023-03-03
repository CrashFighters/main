const settings = require('../../../settings.json');
const requestInfo = require('../../../modules/requestInfo/getInfo').execute;
const parseCookie = require('../parse/cookie.js');

module.exports = {
    async execute({ request } = {}) {
        const languages = await getLanguages(request);
        let messages = {};

        for (const lang of languages) {
            const langMessages = await getLangMessages(lang);
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

async function getLanguages(request) {
    if (!request) return await getSupportedLanguages();

    let languages = [];

    if (request.headers.cookie && parseCookie(request.headers.cookie).language)
        languages.push(parseCookie(request.headers.cookie).language);

    languages.push(
        ...(requestInfo(request).lang?.map?.(({ name }) => name) ?? [])
    );

    languages.push(...await getSupportedLanguages());

    for (const lang of languages)
        if (!(await getSupportedLanguages()).includes(lang))
            languages = languages.filter(l => l !== lang);

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

async function getLangMessages(lang) {
    return require(`../../../messages/${lang}.json`);
}

async function getSupportedLanguages() {
    return settings.generic.lang;
}