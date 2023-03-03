const fs = require('fs');
const settings = require('../../../settings.json');
const mime = require('mime-types');
let gMessages = undefined;

module.exports = {
    async execute(response, code, extra) {
        response.writeHead(code, { 'Content-Type': 'text/plain' });
        if (!extra) extra = {};
        const errorFile = extra.errorFile;
        const customText = extra.text;
        let text = '';

        if (gMessages === undefined)
            try {
                gMessages = (await require('../get/messages').execute()).mainFunction(); //todo: use request
            } catch {
                gMessages = null;
            }

        let errorMessage;
        if (gMessages)
            errorMessage = gMessages.httpStatusCodes[(code + '').split('')[0] * 100];

        if (errorMessage) if (errorMessage[code]) text = errorMessage[code];

        const path = settings.generic.path.files.errorFile.replace('{files}', settings.generic.path.files.files);

        let data = fs.readFileSync(path);

        let newText = data.toString('utf-8').replace('|errorCode|', code).replace('|errorCodeMessage|', text).replace('|reloadText|', gMessages ? gMessages.error.reload : 'Reload');
        data = Buffer.from(newText, 'utf-8');

        if (errorFile) {
            newText = data.toString('utf-8').replace('|errorFile|', errorFile);
            data = Buffer.from(newText, 'utf-8');
        }

        if (customText) {
            newText = data.toString('utf-8').replace('|errorMessage|', customText);
            data = Buffer.from(newText, 'utf-8');
        }

        response.writeHead(code, { 'Content-Type': mime.lookup(path) });
        return response.end(data);
    }
}