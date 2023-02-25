const settings = require('../../../settings.json');
const requestInfo = require('../../../modules/requestInfo/getInfo').execute;

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

    let languages =
        (requestInfo(request).lang?.map?.(({ name }) => name) ?? [])
            .filter(lang => settings.generic.lang.includes(lang));

    languages.push(...settings.generic.lang);

    languages = [...new Set(languages)];

    return languages;
}
