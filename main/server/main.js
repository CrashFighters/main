const fs = require('fs');
const path = require('path');

const middlewares = fs.existsSync(path.resolve(__dirname, './middleware/')) ?
    fs.readdirSync(path.resolve(__dirname, './middleware/')).map(a => require(`./middleware/${a}`)) :
    null;

const settings = require('../../settings.json');
const parseErrorOnline = require('../functions/error/parseErrorOnline').execute;
const parsePostBody = require('../functions/parse/postBody');

module.exports = {
    async execute(request, response) {
        const parseError = (error, customText) => parseErrorOnline(error, response, customText);

        try {
            let body;
            if (request.method === 'POST')
                body = parsePostBody(await waitPost(request));

            const extraData = { body };

            let middlewareData = {};
            if (middlewares)
                for (const middleware of middlewares) {
                    const newMiddlewareData = await middleware({ request, response, extraData });
                    middlewareData = { ...middlewareData, ...newMiddlewareData };
                };

            if (request.url.toLowerCase().startsWith(settings.generic.path.online.api))
                return require('../server/api.js').execute(request, response, { middlewareData, extraData });
            else
                return require('./normal.js').execute(request, response, { middlewareData, extraData });

        } catch (err) {
            parseError(err);
        }
    }
}

function waitPost(request) {
    return new Promise(res => {

        let body = '';
        request.on('data', data => {
            body += data;

            if (body.length > 1e6)
                request.connection.destroy();
        });

        request.on('end', () => {
            res(body);
        });

    });
}