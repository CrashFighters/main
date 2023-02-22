
// ████████╗███████╗███╗░░░███╗██████╗░██╗░░░░░░█████╗░████████╗███████╗  ░██████╗██████╗░██╗░░██╗
// ╚══██╔══╝██╔════╝████╗░████║██╔══██╗██║░░░░░██╔══██╗╚══██╔══╝██╔════╝  ██╔════╝██╔══██╗██║░██╔╝
// ░░░██║░░░█████╗░░██╔████╔██║██████╔╝██║░░░░░███████║░░░██║░░░█████╗░░  ╚█████╗░██║░░██║█████═╝░
// ░░░██║░░░██╔══╝░░██║╚██╔╝██║██╔═══╝░██║░░░░░██╔══██║░░░██║░░░██╔══╝░░  ░╚═══██╗██║░░██║██╔═██╗░
// ░░░██║░░░███████╗██║░╚═╝░██║██║░░░░░███████╗██║░░██║░░░██║░░░███████╗  ██████╔╝██████╔╝██║░╚██╗
// ░░░╚═╝░░░╚══════╝╚═╝░░░░░╚═╝╚═╝░░░░░╚══════╝╚═╝░░╚═╝░░░╚═╝░░░╚══════╝  ╚═════╝░╚═════╝░╚═╝░░╚═╝

//Licensed under CC BY-NC-ND 4.0
//https://creativecommons.org/licenses/by-nc-nd/4.0/


import { onStateChange } from '/sdk/auth.js';
import { deepQuerySelectorAll } from '/common/deepQuerySelectorAll.js';

//check if script on page has the attribute data-debug
const scriptOnPage = document.querySelector('script[data-template_debug]');
const debug = scriptOnPage !== null;

if (debug) console.log('[templateSDK] Debug Mode is enabled.');

const getTemplateValues = (user) => ({
    email: user?.email ?? '',
    displayName: user?.displayName ?? '',
    picture: user?.picture ?? '',
    loggedOut: user !== null,
    loggedIn: user === null,
    custom: null
});

export function replaceTemplates(user) {
    const templateValues = getTemplateValues(user);
    const elements = deepQuerySelectorAll('[data-template]');

    for (const element of elements) {
        const item = element.dataset.template;

        if (debug)
            console.log('[templateSDK] Attempting template ' + item + ' with value ' + templateValues[item] + '.');

        if (!(item in templateValues) && debug) {
            console.error(
                new Error(`[templateSDK] Template ${item} not found.`)
            );
            continue;
        }

        let value = templateValues[item];

        if (
            templateValues[item] === '' &&
            element.dataset['template_fallback'] !== undefined && templateValues[item] !== null
        ) {
            if (debug)
                console.log(
                    `[templateSDK] Using fallback value ${element.dataset['template_fallback']} on template ${item}.`
                );
            value = element.dataset['template_fallback'];
        }

        if (element.dataset['template_var'] !== undefined) {
            if (debug)
                console.log(
                    `[templateSDK] Using custom variable ${element.dataset['template_var']} on template ${item}.`
                );
            value = window[element.dataset['template_var']];
        }

        if (element.dataset['template_update_callback'] !== undefined) {
            //run callback function with the value as parameter
            if (debug)
                console.log(
                    `[templateSDK] Running callback function ${element.dataset['template_update_callback']} on template ${item} with value ${value}.`
                );
            window[element.dataset['template_update_callback']](item, value);
        }

        if (
            element.dataset['template_insert'] === undefined ||
            element.dataset['template_insert'] === 'innerText'
        ) {
            if (debug)
                console.log(
                    `[templateSDK] Replacing template ${item} with value ${value}.`
                );
            element.innerText = value;
        } else {
            if (debug) {
                console.log(
                    `[templateSDK] Replacing template ${item} with value ${value}.`
                );
                console.log(
                    `[templateSDK] Using custom insert method ${element.dataset['template_insert']}.`
                );
            }

            element[element.dataset['template_insert']] = value;
        }
    }

    if (elements.length === 0 && debug)
        throw new Error(
            '[templateSDK] No templates found to replace. Please make sure you have at least one element with the data-template attribute.'
        );
}

onStateChange((user) => {
    replaceTemplates(user);
});
replaceTemplates(null);