const settings = require('../../../settings.json');
const requestInfo = require('../../../modules/requestInfo/getInfo').execute;
const parseCookie = require('../parse/cookie.js');

module.exports = {
    execute({ request } = {}) {
        const languages = getLanguages(request);
        let messages = {};

        for (const lang of languages) {
            const langMessages = require(`../../../messages/${lang}.json`);
            messages = combineMessages(messages, langMessages);
        };

        return {
            languages,
            mainFunction: () => { return messages }
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
    if (!request) return settings.generic.lang;

    let languages = [];

    if (request.headers.cookie && parseCookie(request.headers.cookie).language)
        languages.push(parseCookie(request.headers.cookie).language);

    languages.push(
        ...(requestInfo(request).lang?.map?.(({ name }) => name) ?? [])
    );

    languages.push(...settings.generic.lang);

    languages = languages.filter(lang => settings.generic.lang.includes(lang));
    languages = [...new Set(languages)].reverse();

    return languages;
}