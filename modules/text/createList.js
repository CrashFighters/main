const messages = require('../../main/functions/get/messages').execute().mainFunction();

const and = messages.and;
const comma = ',';

module.exports = {
    createList(words) {
        //todo: use Intl api

        if (words.length === 0) return '';
        if (words.length === 1) return words[0];
        if (words.length === 2) return `${words[0]} ${and} ${words[1]}`;

        let out = words.slice(0, -1).join(comma);

        out += ` ${and} ${words[words.length - 1]}`;

        return out;
    }
};
