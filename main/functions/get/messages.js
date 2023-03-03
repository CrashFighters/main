const requestInfo = require('../../../modules/requestInfo/getInfo').execute;
const parseCookie = require('../parse/cookie.js');
const getConfig = require('../../../modules/remoteConfig/functions/getConfig.js');

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

async function getLangMessages(lang) {
    const config = await getConfig(`messages_${lang}`);
    const messages = {};

    for (const [key, value] of Object.entries(config)) {
        let current = messages;

        for (let keyPartIndex in key.split('_')) {
            keyPartIndex = parseInt(keyPartIndex);
            const keyPart = key.split('_')[keyPartIndex];

            if (!current[keyPart])
                current[keyPart] = keyPartIndex === key.split('_').length - 1 ? value : {};

            current = current[keyPart];

        }
    }

    return messages;
}

async function getSupportedLanguages() {
    const config = await getConfig();
    return config.languages;
}