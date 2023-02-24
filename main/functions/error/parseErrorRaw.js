const fs = require('fs');
const readdirSync = fs.readdirSync;
const writeFileSync = fs.writeFileSync;
const settings = require('../../../settings.json');

module.exports = {
    execute(error, customText) {
        try {
            let errorMessage = error.stack;
            if (errorMessage === undefined) {
                if (`${error}`) {
                    errorMessage = new Error(`${error}`).stack;
                } else {
                    error = new Error('Error message is undefined');
                    errorMessage = error.stack;
                }
            }

            let fileIsSpecial = true;
            let sameFile;

            const files = readdirSync(settings.generic.path.files.errors);

            files.forEach(file => {
                if (file === settings.generic.path.files.noError) return;

                const data = require(`../../.${settings.generic.path.files.errors}${file}`);

                if (data.errorMessage.split(': ')[1] === errorMessage.split('\n')[0].split(': ')[1]) {
                    fileIsSpecial = false;
                    sameFile = file;
                }
            });

            if (fileIsSpecial) {
                const date = new Date().getTime();
                const fileName = `${Math.floor(Math.random() * 100000000)}.json`;
                const path = `${settings.generic.path.files.errors}${fileName}`;
                const obj = {
                    errorMessage: errorMessage.split('\n')[0],
                    occurrences: [
                        {
                            time: date,
                            stack: errorMessage.split('\n')
                        }
                    ]
                };

                //todo: create a function that creates easyAccessPath
                //todo: improve easyAccessPath. For example: exclude node_modules and <anonymous> functions
                let easyAccessPath = null;
                try {
                    easyAccessPath = errorMessage.split('\n')[1].split('(')[1].split(')')[0];
                } catch { }
                if (easyAccessPath) obj.occurrences[0].easyAccessPath = easyAccessPath;

                if (customText) obj.occurrences[0].customText = customText;
                writeFileSync(path, JSON.stringify(obj));
                return `${fileName}`;
            } else {
                const date = new Date().getTime();
                const requirePath = `../../.${settings.generic.path.files.errors}${sameFile}`;
                const fsPath = `${settings.generic.path.files.errors}${sameFile}`;
                const oldObj = require(requirePath);

                const obj = {
                    time: date,
                    stack: errorMessage.split('\n')
                };

                let easyAccessPath = null;
                try {
                    easyAccessPath = errorMessage.split('\n')[1].split('(')[1].split(')')[0];
                } catch { }
                if (easyAccessPath) obj.easyAccessPath = easyAccessPath;

                if (customText) obj.customText = customText;
                oldObj.occurrences.push(obj);
                writeFileSync(fsPath, JSON.stringify(oldObj));
                return sameFile;
            }
        } catch (err) {
            require('./lastFallback').execute(err)
        }
    }
}