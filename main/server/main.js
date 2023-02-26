const fs = require('fs');
const path = require('path');

const middlewares = fs.existsSync(path.resolve(__dirname, './middleware/')) ?
    fs.readdirSync(path.resolve(__dirname, './middleware/')).map(a => ({ ...require(`./middleware/${a}`), name: a.split('.')[0] })) :
    [];

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

            let parseErrorCalled = false;
            let middlewareData = {};
            const executedMiddlewares = [];

            while (middlewares.length > executedMiddlewares.length)
                for (const { execute, info, name } of middlewares) {
                    if (executedMiddlewares.includes(name)) continue;
                    if (info?.requires && info.requires.some(name => !executedMiddlewares.includes(name))) continue;

                    const newMiddlewareData = await execute({
                        request,
                        extraData,
                        parseError: (...arg) => {
                            parseErrorCalled = true;
                            parseError(...arg);
                        },
                        middlewareData
                    }) ?? {};
                    middlewareData = { ...middlewareData, ...newMiddlewareData };

                    executedMiddlewares.push(name);

                    if (parseErrorCalled)
                        break;
                };

            if (!parseErrorCalled)
                if (request.url.startsWith('/dbApi/'))
                    return require('./dbApi.js').execute(request, response, { middlewareData, extraData });
                else if (request.url.startsWith('/api/'))
                    return require('./api.js').execute(request, response, { middlewareData, extraData });
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