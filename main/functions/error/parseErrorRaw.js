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

            let files = readdirSync(settings.generic.path.files.errors);

            files.forEach(file => {
                if (file == settings.generic.path.files.noError) return;

                let data = require(`../../.${settings.generic.path.files.errors}${file}`);

                if (data.errorMessage.split(': ')[1] == errorMessage.split('\n')[0].split(': ')[1]) {
                    fileIsSpecial = false;
                    sameFile = file;
                }
            });

            if (fileIsSpecial) {
                let date = new Date().getTime();
                let fileName = `${Math.floor(Math.random() * 100000000)}.json`;
                let path = `${settings.generic.path.files.errors}${fileName}`;
                let obj = {
                    errorMessage: errorMessage.split('\n')[0],
                    occurrences: [
                        {
                            time: date,
                            stack: errorMessage.split('\n')
                        }
                    ]
                };

                let easyAccesPath = null;
                try {
                    easyAccesPath = errorMessage.split('\n')[1].split('(')[1].split(')')[0];
                } catch { }
                if (easyAccesPath) obj.occurrences[0].easyAccesPath = easyAccesPath;

                if (customText) obj.occurrences[0].customText = customText;
                writeFileSync(path, JSON.stringify(obj));
                return `${fileName}`;
            } else {
                let date = new Date().getTime();
                let requirePath = `../../.${settings.generic.path.files.errors}${sameFile}`;
                let fsPath = `${settings.generic.path.files.errors}${sameFile}`;
                let oldObj = require(requirePath);

                let obj = {
                    time: date,
                    stack: errorMessage.split('\n')
                };

                let easyAccesPath = null;
                try {
                    easyAccesPath = errorMessage.split('\n')[1].split('(')[1].split(')')[0];
                } catch { }
                if (easyAccesPath) obj.easyAccesPath = easyAccesPath;

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