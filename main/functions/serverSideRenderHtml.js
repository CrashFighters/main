module.exports = (html, isPrivate) => {
    let newHtml = html;

    if (isPrivate)
        newHtml += '<script>window.privateFile = true;</script>';

    newHtml = newHtml.replaceAll('<link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet" />', `
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
        <noscript><link rel="stylesheet" href="styles.css"></noscript>
    `)

    return newHtml;
}