const fs = require('fs');
const pathLib = require('path');

const preloadScripts = [
    ...fs.readdirSync(pathLib.resolve(__dirname, '../../publicFiles/sdk/')).map(f => `/sdk/${f}`),
    ...fs.readdirSync(pathLib.resolve(__dirname, '../../publicFiles/js/')).map(f => `/js/${f}`),
    ...fs.readdirSync(pathLib.resolve(__dirname, '../../publicFiles/common/')).map(f => `/common/${f}`)
];

/*
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
*/

// const highPriority = [
//     '/sdk/language.js',
//     '/sdk/templates.js',
//     '/sdk/auth.js',
//     '/sdk/googleLoginButtons.js'
// ];

// const lowPriority = [
//     '/sdk/oneTap.js',
//     '/sdk/recaptcha.js',
//     '/sdk/zeroTap.js',
//     '/js/2fa.js',
//     '/js/appCheck.js',
//     '/js/database.js',
//     '/js/login.js',
//     '/js/settings.js'
// ];

module.exports = ({ data }) => {
    const headers = {};

    let loadedFiles = [];
    for (const preloadScript of preloadScripts)
        if (data.includes(`<script type="module" src="${preloadScript}"></script>`))
            loadedFiles.push({ path: preloadScript });

    // add all preloadPublicFiles to loadedFiles
    let changed = true;
    while (changed) {
        changed = false;
        for (const loadedFile of loadedFiles) {
            const { filePreloadPublicFiles, type, fetchPriority } = getPublicFilePreloadInfo(loadedFile.path);

            if (!loadedFile.type) {
                loadedFile.type = type;
                changed = true;
            }

            if ((![null, undefined].includes(loadedFile.fallbackFetchPriority)) && [null, undefined].includes(fetchPriority)) {
                loadedFile.fetchPriority = loadedFile.fallbackFetchPriority;
                delete loadedFile.fallbackFetchPriority;
                changed = true;
            }

            if (loadedFile.fetchPriority === undefined) {
                loadedFile.fetchPriority = fetchPriority;
                changed = true;
            }

            for (const preloadPublicFile of filePreloadPublicFiles)
                if (!loadedFiles.find(({ path }) => path === preloadPublicFile)) {
                    loadedFiles.push({ path: preloadPublicFile, fallbackFetchPriority: fetchPriority });
                    changed = true;
                } else if (
                    ![null, undefined].includes(loadedFile.fetchPriority) && (
                        [null, undefined].includes(loadedFiles.find(({ path }) => path === preloadPublicFile).fetchPriority) ||
                        (loadedFiles.find(({ path }) => path === preloadPublicFile).fetchPriority === 'low' && loadedFile.fetchPriority === 'high')
                    )
                ) {
                    loadedFiles.find(({ path }) => path === preloadPublicFile).fetchPriority = loadedFile.fetchPriority;
                    changed = true;
                }
        }
    };

    loadedFiles = loadedFiles.sort((a, b) => {
        if (a.fetchPriority === 'high' && b.fetchPriority !== 'high') return -1;
        if (a.fetchPriority !== 'high' && b.fetchPriority === 'high') return 1;

        if (a.fetchPriority === 'low' && b.fetchPriority !== 'low') return 1;
        if (a.fetchPriority !== 'low' && b.fetchPriority === 'low') return -1;

        return 0;
    })

    const links = [];
    for (const { path, type, fetchPriority } of loadedFiles)
        links.push(`<${path}>; rel=modulepreload; as=${type}${fetchPriority ? `; fetchpriority=${fetchPriority}` : ''}`);

    if (links.length > 0)
        headers['Link'] = links.join(', ');

    return headers;
}

function getPublicFilePreloadInfo(path) {
    const file = fs.existsSync(pathLib.resolve(__dirname, `../../publicFiles${path}`)) ?
        fs.readFileSync(pathLib.resolve(__dirname, `../../publicFiles${path}`)).toString() :
        '';

    const filePreloadPublicFiles = getPreloadPublicFiles(file);
    const fetchPriority = getFetchpriority(file)

    const type = Object.entries({
        '.js': 'script',
        '.css': 'style'
    }).find(([key]) => path.endsWith(key))?.[1];

    if (!type)
        throw new Error('Unknown type for file: ' + path)

    return { filePreloadPublicFiles, type, fetchPriority };
}

function getPreloadPublicFiles(file) {
    if (!(file.includes('--preloadPublicFiles--') && file.includes('--endPreloadPublicFiles--'))) return [];
    file = file.split('\n');

    return file
        .slice(
            file.findIndex(a => a.includes('--preloadPublicFiles--')) + 1,
            file.findIndex(a => a.includes('--endPreloadPublicFiles--'))
        )
        .filter(a => a.trim() !== '')
}

function getFetchpriority(file) {
    if (!file.includes('--fetchPriority--: ')) return null;
    return file.split('\n').find(a => a.includes('--fetchPriority--: ')).split(':').slice(1).join(':').trim() || null;
}