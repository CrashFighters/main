import { deepQuerySelectorAll } from '/common/deepQuerySelectorAll.js';

let messages = await fetch('/api/messages');
messages = await messages.json();

export function getMessage(message) {
    return messages.pages[window.location.pathname]?.[message] || messages.general[message] || message;
};

const elements = deepQuerySelectorAll('[data-lang_text]');

for (const element of elements)
    element.innerText = getMessage(element.dataset.lang_text);