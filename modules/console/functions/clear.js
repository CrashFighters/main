const fs = require('fs');
const settings = require('../settings.json');

module.exports = {
    execute() {
        fs.writeFileSync(`.${settings.path.files.console}`, '');
        console.clear();
    }
}