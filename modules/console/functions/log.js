const fs = require('fs');
const settings = require('../settings.json')

module.exports = {
    execute(text) {
        let cConsole = fs.readFileSync(`.${settings.path.files.console}`);
        cConsole = `${cConsole}${text}\n`;
        fs.writeFileSync(`.${settings.path.files.console}`, cConsole);

        console.log(text);
    }
}