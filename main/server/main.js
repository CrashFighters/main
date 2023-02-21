const fs = require('fs');
const path = require('path');
const middlewares = fs.existsSync(path.resolve(__dirname, '/middleware/')) ?
    fs.readdirSync(path.resolve(__dirname, './middleware/')).map(a => require(`./middleware/${a}`)) :
    null;

const settings = require('../../settings.json');
const parseErrorOnline = require('../functions/error/parseErrorOnline').execute;

module.exports = {
    async execute(request, response) {
        const parseError = (error, customText) => parseErrorOnline(error, response, customText);

        try {

            let middlewareData = {};
            if (middlewares)
                for (const middleware of middlewares) {
                    const newMiddlewareData = await middleware(request, response);
                    middlewareData = { ...middlewareData, ...newMiddlewareData };
                };

            if (request.url.toLowerCase().startsWith(settings.generic.path.online.api))
                return require('../server/api.js').execute(request, response, middlewareData);
            else
                return require('./normal.js').execute(request, response, middlewareData);

        } catch (err) {
            parseError(err);
        }
    }
}