const { get, set } = require('../modules/database/functions/database.js');
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
            const { path, params } = require('../functions/parse/dbApiCall.js').execute(request.url);
            const { authentication, authenticated } = middleWareData;

            let db = get();

            doApiCall({
                db,
                set,
                path,
                params,
                method: request.method,
                requireParams: (params) => {
                    for (const { name, type } of params) {
                        if (!params.name) {
                            statusCode(response, 400, { text: `Missing parameter; ${name}`, short: 'missingParameter' });
                            return false;
                        }

                        //todo: check if param has correct type. Example types: communityId, userId, postId, string
                    }

                    return true;
                }
            })

            throw new Error('Not implemented');

        } catch (err) {
            parseError(err);
        }
    }
}

function doApiCall({ db, set, path, params, method }) {
    throw new Error('not implemented')
}