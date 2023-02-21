const api = require('../setup/preload/api.js').execute();

const isModuleInstalled = require('../functions/isModuleInstalled.js').execute;
const parseErrorOnline = require('../functions/error/parseErrorOnline.js').execute;

const statusCode = (response, code, { text, short }) => {
    response.end(JSON.stringify({
        error: true,
        code,
        text,
        short
    }));
}

module.exports = {
    execute(request, response, middleWareData) {
        const parseError = (error, customText) => parseErrorOnline(error, response, customText);

        try {
            const messages = require('../functions/get/messages').execute({ request }).mainFunction();
            const { path, params } = require('../functions/parse/apiCall.js').execute(request.url);

            if (api[path])
                if (api[path].enabled.dependencies.installed) {
                    const file = api[path].file;
                    const executeFunctionExists = Boolean(file?.execute);

                    if (!executeFunctionExists)
                        return parseError(new Error(messages.error.executeFunctionNotFoundWithFile.replace('{file}', path)), messages.error.executeFunctionNotFound);

                    //todo: implement other methods
                    if (request.method === 'GET')
                        file.execute({
                            statusCode: (code, short, text) => {
                                statusCode(response, code, { text, short });
                            },
                            parseError,
                            end: data => {
                                response.end(data);
                            },
                            request,
                            isModuleInstalled,
                            params,
                            response,
                            middleWareData
                        });
                    else
                        throw new Error(`Method ${request.method} not implemented`)
                } else
                    return parseError(new Error(messages.error.moduleNotInstalledForShort.replace('{api}', path)), messages.error.moduleNotInstalledFor.replace('{api}', path).replace('{dependency}', api[path].enabled.dependencies.dependenciesNotInstalled.join(', ')));
            else
                return statusCode(response, 404, { text: messages.error.apiCallNotFound });

        } catch (err) {
            parseError(err);
        }
    }
}