const parseErrorRaw = require('./parseErrorRaw').execute;
const evalErrors = require('./evalErrors').execute;
const statusCode = require('./statusCode.js').execute;

module.exports = {
    execute(error, response, customText) { //todo-imp: change to async
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

            let file = parseErrorRaw(error, customText);

            evalErrors();
            file = file.split('.txt')[0];
            if (response)
                return await statusCode(response, 500, { errorFile: file, text: customText });
        } catch (err) {
            if (response)
                try {
                    await statusCode(response, 500)
                } catch { }
            await require('./lastFallback').execute(err);
        }
    }
}