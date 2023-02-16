const settings = require('../settings.json')
const perspective = require(`../${settings.generic.path.files.modules}perspective/functions/perspective.js`);

module.exports = {
    execute({ end }) {
        end();
    }
}