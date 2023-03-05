const getMessages = require('../main/functions/get/messages.js');

module.exports = {
    async execute({ request, end, parseError }) {
        try {
            const messages = (await getMessages.execute({ request })).messages;

            end(JSON.stringify(messages));
        } catch (e) {
            await parseError(e);
        }
    }
}