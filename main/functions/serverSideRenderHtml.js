const fs = require('fs');
const path = require('path');

const inlineCssStartString = '<!-- inlineCss: ';
const inlineCssEndString = ' -->';

module.exports = (html, isPrivate) => {

    if (isPrivate)
        html += '<script>window.privateFile = true;</script>';

    html = html.replaceAll('<link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet" />', `
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link rel="preload" href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'">
        <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto&display=swap"></noscript>
    `);

    let inlineCssIndex = html.indexOf(inlineCssStartString);
    while (inlineCssIndex !== -1) {
        const endIndex = html.indexOf(inlineCssEndString, inlineCssIndex);

        const cssPath = html.substring(inlineCssIndex + inlineCssStartString.length, endIndex);
        const parsedCssPath = path.resolve(`.${cssPath}`);
        if (![path.resolve(__dirname, '../../publicFiles/'), path.resolve(__dirname, '../../privateFiles/')].some(p => parsedCssPath.startsWith(p))) {
            inlineCssIndex = html.indexOf(inlineCssStartString, inlineCssIndex + 1);
            continue;
        }

        const css = fs.readFileSync(parsedCssPath).toString();
        const injection = `<style>${css}</style>`;
        const oldValue = inlineCssStartString + cssPath + inlineCssEndString;

        html = html.substring(0, inlineCssIndex) + injection + html.substring(inlineCssIndex + oldValue.length + inlineCssEndString.length);

        inlineCssIndex = html.indexOf(inlineCssStartString, inlineCssIndex + 1);
    }

    return html;
}