const fs = require('fs');
const settings = require('../../../settings.json');
let gMessages;

try {
    gMessages = require('../get/messages').execute().mainFunction();
} catch {
    gMessages = undefined;
}

let extremeErrorMode = false;
let reloadMode = 0;

let cConsole = console;
if (require('../../functions/isModuleInstalled').execute('console')) {
    cConsole = {
        clear: require(`../../.${settings.generic.path.files.modules}console/functions/clear`).execute,
        log: require(`../../.${settings.generic.path.files.modules}console/functions/log`).execute,
        warn: require(`../../.${settings.generic.path.files.modules}console/functions/warn`).execute
    }
}

let amountError = 0;
let lastError = '';
let lastErrorTime = 0;

module.exports = {
    execute(err, response) {
        if (response)
            try {
                require('./statusCode').execute(response, 500);
            } catch { }

        let timeDiff = new Date().getTime() - lastErrorTime;
        if (timeDiff > 1000) amountError = 0;
        let retry = true;

        let currentErr = `${err}`.split('\n')[0];
        if (currentErr == lastError && timeDiff < 1000) {
            amountError += 1;
        } else {
            lastError = currentErr;
            amountError = 1;
        }

        let stack = err.stack;
        if (!stack) stack = new Error('No error stack given').stack.split('\n').splice(1).join('\n');

        let data = `${`${err}`.split('\n')[0]}\n\n\nStack${err.stack ? '' : ' (No stack given)'}:\n${stack}`

        fs.writeFileSync(`${settings.generic.path.files.errors}RAW1-${amountError}-${Math.floor(Math.random() * 1000)}.txt`, data);

        if (amountError > 5 && timeDiff < 1000) retry = false;
        cConsole.clear();

        if (retry) {

            reloadMode++;

            countDown(5, 1000, ii => {
                cConsole.clear();
                cConsole.log(`Retrying in ${ii} seconds...`);
            });

            setTimeout(() => {
                reloadMode--;
                lastErrorTime = new Date().getTime();

                try {
                    require('./evalErrors').execute();
                } catch { }
            }, 5000);

        } else {
            cConsole.log('No retry, because of looping error');
            extremeErrorMode = true;
        }

    },
    extremeServer(r, response) {
        response.writeHead(500, "The server has an extreme error, please try again later");
        response.end("The server has an extreme error, please try again later");
        cConsole.warn("New request in extreme error mode")
    },
    reloadServer(r, response) {
        let messages;
        try {
            messages = require('../get/messages').execute({ request: r }).mainFunction();
        } catch {
            messages = gMessages;
        }

        let reloadingPath = settings.generic.path.files.reloadingFile.replace('{files}', settings.generic.path.files.files);
        response.writeHead(500, "Because of an extreme error, the server is reloading in 5 seconds");
        try {
            let data = Buffer.from(fs.readFileSync(reloadingPath).toString('utf-8').replace('|reloadText|', messages ? messages.error.clientServerReload : ''));
            response.end(data);
        } catch (err) {
            response.end("Because of an extreme error, the server is reloading in 5 seconds")
        }
    },
    serverExecute(a1, a2) {

        if (extremeErrorMode) {
            let t = require(__filename);
            t.extremeServer(a1, a2);
        } else if (reloadMode > 0) {
            let t = require(__filename);
            t.reloadServer(a1, a2);
        } else {
            try {
                require('../../server/main').execute(a1, a2);
            } catch (err) {
                (a => { })(err.stack)
                let t = require(__filename);
                t.execute(err, a2);
            }
        }
    }
}

function asyncTimeout(wait) {
    return new Promise(resolve => setTimeout(resolve, wait))
}

async function countDown(start, wait, callback) {
    let ii = start;
    while (ii > 0) {
        callback(ii);
        ii--;
        await asyncTimeout(wait);
    }
    callback(0);
}