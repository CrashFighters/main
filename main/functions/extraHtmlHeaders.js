const fs = require('fs');
const path = require('path');

const preloadScripts = [
    ...fs.readdirSync(path.resolve(__dirname, '../../publicFiles/sdk/')).map(f => `/sdk/${f}`),
    ...fs.readdirSync(path.resolve(__dirname, '../../publicFiles/js/')).map(f => `/sdk/${f}`),
    ...fs.readdirSync(path.resolve(__dirname, '../../publicFiles/common/')).map(f => `/sdk/${f}`)
];

// module.exports = (html, request, isPrivate) => {
module.exports = (html) => {
    const headers = {};

    const links = [];

    for (const preloadScript of preloadScripts) {
        if (html.includes(`<script type="module" src="${preloadScript}"></script>`))
            links.push(`<${preloadScript}>; rel=preload; as=script`);
    };

    if (links.length > 0)
        headers['Link'] = links.join(', ');

    console.log(headers)
    process.exit()

    return headers;
}