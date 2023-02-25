const getMessages = require('../main/functions/get/messages');

module.exports = {
    execute({ request, end }) {
        const messages = getMessages.execute({ request }).mainFunction();

        end(JSON.stringify(messages));
    }
}