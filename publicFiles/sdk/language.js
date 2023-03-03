/*

--fetchPriority--: high

--fileRequirements--
/common/deepQuerySelectorAll.js
/api/messages
--endFileRequirements--

*/

import { deepQuerySelectorAll } from '/common/deepQuerySelectorAll.js';

let messages;
await executeFast();

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
    await executeFast(true); //todo: use remoteConfig to get the messages
}

async function executeFast(preventExecute) {
    messages = await fetch('/api/messages', {
        method: 'GET',
        credentials: 'include',
        mode: 'no-cors' //to allow to use the preload
    });
    messages = await messages.json();

    updateHtml();

    if (preventExecute)
        await execute();
}

function updateHtml() {
    const html = document.querySelector('html');
    html.lang = messages.info.code;

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