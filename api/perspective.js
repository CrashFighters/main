const settings = require('../settings.json')
const perspective = require(`../${settings.generic.path.files.modules}perspective/functions/perspective.js`);

module.exports = {
    async execute({ end, params, statusCode }) {
        if (!params.message) return statusCode(400, 'No message provided');
        const result = await perspective(params.message);

        end(JSON.stringify(result));
    }
}