const parseErrorOnline = require('../functions/error/parseErrorOnline.js').execute;

const statusCode = (response, code, { text, short }) => {
    response.writeHead(code, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({
        error: true,
        code,
        text,
        short
    }));
}

module.exports = {
    execute(request, response, { middleWareData, extraData }) {
        const parseError = (error, customText) => parseErrorOnline(error, response, customText);

        try {

            throw new Error('Not implemented');

        } catch (err) {
            parseError(err);
        }
    }
}