const readdir = require('util').promisify(require('fs').readdir);

const settings = require('../../../settings.json');
const messages = require('../get/messages').execute().mainFunction();

let cConsole = console;
if (require('../../functions/isModuleInstalled').execute('console')) {
    cConsole = {
        clear: require(`../../.${settings.generic.path.files.modules}console/functions/clear`).execute,
        log: require(`../../.${settings.generic.path.files.modules}console/functions/log`).execute,
        warn: require(`../../.${settings.generic.path.files.modules}console/functions/warn`).execute
    }
}

module.exports = {
    async execute() {
        cConsole.clear();
        cConsole.log(`Listening on port ${settings.generic.port}...`);

        try {
            const files =
                (await readdir(settings.generic.path.files.errors))
                    .filter(val => val !== settings.generic.path.files.noError);

            if (files[0]) {
                cConsole.clear();
                cConsole.log(`Listening on port ${settings.generic.port}...`);
                cConsole.log();
                cConsole.log();
                let message = messages.error.thereAreErrors.replace('{amount}', files.length);
                if (files.length === 1) message = messages.error.thereIsError.replace('{amount}', files.length);

                cConsole.warn(message);
                files.forEach((val) => {
                    const occurrences = require(`../../../${settings.generic.path.files.errors}${val}`).occurrences.length;
                    cConsole.warn(`${settings.generic.path.files.errors}${val}\t\t${occurrences}`);
                });

                cConsole.log();
            }
        } catch (err) {
            require('./lastFallback').execute(err);
        }
    }
}
