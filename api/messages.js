const getMessages = require('../main/functions/get/messages');

module.exports = {
    async execute({ request, end, parseError }) {
        try {
            const messages = (await getMessages.execute({ request })).mainFunction();

            end(JSON.stringify(messages));
        } catch (e) {
            parseError(e);
        }
    }
}