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
    '/sk/zeroTap.js': ['/sdk/auth.js', '/common/apiKeys.js', '/common/doesDocumentIncludeScript.js'],
    '/js/2fa': ['/sdk/auth.js'],
    '/js/appCheck.js': ['/common/apiKeys.js'],
    '/js/database.js': ['/sdk/auth.js'],
    '/js/login.js': ['/sdk/auth.js', '/common/isMobile.js'],
    '/js/settings.js': ['/sdk/auth.js']
};

module.exports = ({ data }) => {
    const headers = {};

    const loadedFiles = [];
    for (const preloadScript of preloadScripts)
        if (data.includes(`<script type="module" src="${preloadScript}"></script>`))
            loadedFiles.push({ path: preloadScript, type: 'script' });

    // add all requirements to loadedFiles
    let changed = true;
    while (changed) {
        changed = false;
        for (const preloadScript of preloadScripts)
            if (requirements[preloadScript])
                for (const requirement of requirements[preloadScript])
                    if (!loadedFiles.find(({ path }) => path === requirement)) {
                        loadedFiles.push({ path: requirement, type: 'script' });
                        changed = true;
                    }
    };

    const links = [];
    for (const { path, type } of loadedFiles)
        links.push(`<${path}>; rel=modulepreload; as=${type}`);

    if (links.length > 0)
        headers['Link'] = links.join(', ');

    return headers;
}