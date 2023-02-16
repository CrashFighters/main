const settings = require('../settings.json')
const perspective = require(`../${settings.generic.path.files.modules}perspective/functions/perspective.js`);

module.exports = {
    async execute({ end }) {
        const response = await perspective('Hallo allemaal! Wat een mooie dag vandaag.')

        end(JSON.stringify(response))
    }
}