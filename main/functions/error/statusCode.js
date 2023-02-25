const fs = require('fs');
const settings = require('../../../settings.json');
let gMessages;
try {
    gMessages = require('../get/messages').execute().mainFunction();
} catch (err) {
    gMessages = undefined;
}
const mime = require('mime-types');

module.exports = {
    execute(response, code, extra) {
        response.writeHead(code, { 'Content-Type': 'text/plain' });
        if (!extra) extra = {};
        const errorFile = extra.errorFile;
        const customText = extra.text;
        let text = '';

        let errorMessage;
        if (gMessages)
            errorMessage = gMessages.httpStatusCodes[(code + '').split('')[0] * 100];

        if (errorMessage) if (errorMessage[code]) text = errorMessage[code];

        const path = settings.generic.path.files.errorFile.replace('{files}', settings.generic.path.files.files);

        fs.readFile(path, async function (err, data) {
            if (err) throw err;
            let newData = data;

            let newText = newData.toString('utf-8').replace('|errorCode|', code).replace('|errorCodeMessage|', text).replace('|reloadText|', gMessages ? gMessages.error.reload : 'Reload');
            newData = Buffer.from(newText, 'utf-8');

            if (errorFile) {
                newText = newData.toString('utf-8').replace('|errorFile|', errorFile);
                newData = Buffer.from(newText, 'utf-8');
            }

            if (customText) {
                newText = newData.toString('utf-8').replace('|errorMessage|', customText);
                newData = Buffer.from(newText, 'utf-8');
            }

            response.writeHead(code, { 'Content-Type': mime.lookup(path) });
            return response.end(newData);
        });
    }
}
