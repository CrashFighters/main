const parseErrorRaw = require('./parseErrorRaw.js').execute;
const evalErrors = require('./evalErrors').execute;
const statusCode = require('./statusCode.js').execute;

module.exports = {
    async execute(error, response, customText) {
        try {
            let errorMessage = error.stack;
            if (errorMessage === undefined) {
                if (`${error}`) {
                    errorMessage = new Error(`${error}`).stack;
                } else {
                    error = new Error('Error message is undefined');
                    errorMessage = error.stack;
                }
            }

            let file = await parseErrorRaw(error, customText);
            if (file)
                file = file.split('.')[0];

            evalErrors();
            if (response)
                return await statusCode({ response, code: 500, errorFile: file, text: customText }); //todo: add request
        } catch (error) {
            await require('./lastFallback.js').execute({ error, response }); //todo: add request
        }
    }
}