import { deepQuerySelectorAll } from '/common/deepQuerySelectorAll.js';

let messages;
await execute();

export function getMessage(message) {
    return findMessageInMessages(message) ||
        (findMessageInMessages(flipFirstLetterCase(message)) ?
            flipFirstLetterCase(findMessageInMessages(flipFirstLetterCase(message))) :
            message);
};

function findMessageInMessages(message) {
    return messages.pages[window.location.pathname]?.[message] || messages.general[message];
}

function flipFirstLetterCase(string) {
    return ((string[0].toUpperCase() === string[0]) ? string[0].toLowerCase() : string[0].toUpperCase()) + string.slice(1);
}

async function execute() {
    messages = await fetch('/api/messages');
    messages = await messages.json();

    const innerTextElements = deepQuerySelectorAll('[data-lang_text]');

    for (const element of innerTextElements)
        element.innerText = getMessage(element.dataset.lang_text);

    const placeholderElements = deepQuerySelectorAll('[data-lang_placeholder]');

    for (const element of placeholderElements)
        element.placeholder = getMessage(element.dataset.lang_placeholder);
}

export const _ = {
    execute
}