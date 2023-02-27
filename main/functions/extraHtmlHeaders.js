const fs = require('fs');
const path = require('path');

const preloadScripts = [
    ...fs.readdirSync(path.resolve(__dirname, '../../publicFiles/sdk/')).map(f => `/sdk/${f}`),
    ...fs.readdirSync(path.resolve(__dirname, '../../publicFiles/js/')).map(f => `/sdk/${f}`),
    ...fs.readdirSync(path.resolve(__dirname, '../../publicFiles/common/')).map(f => `/sdk/${f}`)
];

const requirements = {
    '/sdk/auth.js': ['/js/appCheck.js', '/common/apiKeys.js', '/common/cookie.js'],
    '/sdk/googleLoginButtons.js': ['/common/cookie.js', '/common/apiKeys.js', '/common/doesDocumentIncludeScript.js', '/common/isMobile.js', '/sdk/auth.js'],
    '/sdk/language.js': ['/common/deepQuerySelectorAll.js'],
    '/sdk/oneTap.js': ['/sdk/auth.js', '/common/apiKeys.js', '/common/doesDocumentIncludeScript.js'],
    '/sdk/recaptcha.js': ['/common/apiKeys.js', '/common/doesDocumentIncludeScript.js'],
    '/sdk/templates.j': ['/sdk/auth.js', '/common/deepQuerySelectorAll.js'],
    '/sk/zeroTap.js': ['/sdk/auth.js', '/common/apiKeys.js', '/common/doesDocumentIncludeScript.js']
};

// module.exports = (html, request, isPrivate) => {
module.exports = (html) => {
    const headers = {};


    const loadedScripts = [];
    for (const preloadScript of preloadScripts)
        if (html.includes(`<script type="module" src="${preloadScript}"></script>`))
            loadedScripts.push(preloadScript);

    let changed = true;
    while (changed) {
        changed = false;
        for (const preloadScript of preloadScripts)
            if (requirements[preloadScript])
                for (const requirement of requirements[preloadScript])
                    if (!loadedScripts.includes(requirement)) {
                        loadedScripts.push(requirement);
                        changed = true;
                    }
    };

    console.log(loadedScripts)

    const links = [];
    for (const loadedScript of loadedScripts)
        links.push(`<${loadedScript}>; rel=preload; as=script`);

    if (links.length > 0)
        headers['Link'] = links.join(', ');

    return headers;
}