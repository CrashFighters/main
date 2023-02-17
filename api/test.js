const settings = require('../settings.json')
// const authentication = require(`../${settings.generic.path.files.modules}authentication/functions/authentication.js`);
const { get, set } = require(`../modules/database/functions/database.js`);

module.exports = {
    execute({ end }) {
        end();
    }
}