module.exports = (html, isPrivate) => {
    let newHtml = html;

    if (isPrivate)
        newHtml += '<script>window.privateFile = true;</script>';

    return newHtml;
}