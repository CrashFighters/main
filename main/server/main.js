const fs = require('fs');
const path = require('path');

const middlewares = fs.existsSync(path.resolve(__dirname, './middleware/')) ?
    fs.readdirSync(path.resolve(__dirname, './middleware/')).map(a => ({ ...require(`./middleware/${a}`), name: a.split('.')[0] })) :
    [];

const parseErrorOnline = require('../functions/error/parseErrorOnline.js').execute;
const parsePostBody = require('../functions/parse/postBody.js');
const generalStatusCode = require('../functions/error/statusCode.js');

const dbApi = require('./dbApi.js');
const api = require('./api.js');
const normal = require('./normal.js');

module.exports = {
    async execute(request, response) {
        const parseError = (error, customText) => parseErrorOnline(error, response, customText);
        const statusCode = (code, text) => generalStatusCode(response, code, { text });

        try {
            let body;
            if (request.method === 'POST')
                body = parsePostBody(await waitPost(request));

            const extraData = { body };

            let responded = false;
            let cachedMiddlewareData = {};
            const executedMiddlewares = [];

            async function executeMiddleware(name) {
                if (executedMiddlewares.includes(name)) return true;
                const middleware = middlewares.find(a => a.name === name);

                if (middleware.info?.requires) {
                    for (const { name } of middleware.info.requires)
                        if (!await executeMiddleware(name)) return false;
                }

                const newMiddlewareData = await middleware.execute({
                    request,
                    response,
                    extraData,
                    parseError: (...arg) => {
                        if (!responded) {
                            responded = true;
                            parseError(...arg);
                        }
                    },
                    middlewareData: cachedMiddlewareData,
                    statusCode: (...arg) => {
                        if (!responded) {
                            responded = true;
                            statusCode(...arg);
                        }
                    }
                });

                executedMiddlewares.push(name);
                if (!newMiddlewareData) return false;

                cachedMiddlewareData = { ...cachedMiddlewareData, ...newMiddlewareData };

                return !responded;
            };

            const middlewareData = {};
            for (const { name } of middlewares)
                Object.defineProperty(middlewareData, name, {
                    configurable: false,
                    enumerable: true,
                    get: async () => {
                        if (!await executeMiddleware(name)) return undefined;
                        return cachedMiddlewareData[name];
                    }
                });

            if (!responded)
                if (request.url.startsWith('/dbApi/'))
                    return dbApi.execute(request, response, { middlewareData, extraData });
                else if (request.url.startsWith('/api/'))
                    return api.execute(request, response, { middlewareData, extraData });
                else
                    return normal.execute(request, response, { middlewareData, extraData });

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