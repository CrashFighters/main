const fs = require('fs');
const path = require('path');
const middlewares = fs.readdirSync(path.resolve(__dirname, './middleware/')).map(a => require(`./middleware/${a}`));

const settings = require('../../settings.json');
const parseErrorOnline = require('../functions/error/parseErrorOnline').execute;

module.exports = {
    async execute(request, response) {
        const parseError = (error, customText) => parseErrorOnline(error, response, customText);

        try {

            // if (request.url.toLowerCase() == '/errors') {
            //     let t = [];
            //     require('fs').readdirSync('./logs/errors/').forEach(v => t.push(require('fs').readFileSync('./logs/errors/' + v).toString()))
            //     return response.end(JSON.stringify(t))
            // } else

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