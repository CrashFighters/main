const fs = require('fs');
const path = require('path');
//todo: check if middleware folder exists
const middlewares = fs.readdirSync(path.resolve(__dirname, './middleware/')).map(a => require(`./middleware/${a}`));

const settings = require('../../settings.json');
const parseErrorOnline = require('../functions/error/parseErrorOnline').execute;

module.exports = {
    async execute(request, response) {
        const parseError = (error, customText) => parseErrorOnline(error, response, customText);

        try {

            let middlewareData = {};
            for (const middleware of middlewares) {
                const newMiddlewareData = await middleware(request, response);
                middleWareData = { ...middlewareData, ...newMiddlewareData };
            };

            if (request.url.toLowerCase().startsWith(settings.generic.path.online.api))
                return require('../server/api.js').execute(request, response, middleWareData);
            else
                return require('./normal.js').execute(request, response, middleWareData);

        } catch (err) {
            parseError(err);
        }
    }
}