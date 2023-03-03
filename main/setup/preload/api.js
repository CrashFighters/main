const fs = require('fs');
const { readdirSync, existsSync, statSync } = fs;

const parseErrorRaw = require('../../functions/error/parseErrorRaw').execute;
const evalErrors = require('../../functions/error/evalErrors').execute;
let messages;

const generic = require('../../../settings.json').generic;
let api;

async function addApiCalls(websitePath, path) {
    if (existsSync(path))
        for (const name of readdirSync(path))
            if (statSync(`${path}${name}`).isDirectory())
                await addApiCalls(`${websitePath}${name}/`, `${path}${name}/`);
            else {
                const apiName = name.split('.js')[0];
                const file = require(`../../../${path}${apiName}`);

                let dependenciesInstalled = true;
                const dependenciesNotInstalled = [];
                if (file.dependencies && file.dependencies.modules)
                    for (const dependency of file.dependencies.modules)
                        if (!existsSync(`${generic.path.files.modules}${dependency}/`)) {
                            dependenciesInstalled = false;
                            dependenciesNotInstalled.push(dependency);
                        }

                api[`${websitePath}${apiName}`] = {
                    file: require(`../../../${path}${apiName}`),
                    enabled: {
                        dependencies: {
                            installed: dependenciesInstalled,
                            dependenciesNotInstalled
                        }
                    }
                };

                if (!dependenciesInstalled) {
                    if (!messages)
                        messages = (await require('../../functions/get/messages').execute()).mainFunction();
                    parseErrorRaw(new Error(messages.error.moduleNotInstalledForShort.replace('{api}', `${websitePath}${apiName}`)), messages.error.moduleNotInstalledFor.replace('{api}', `${websitePath}${apiName}`).replace('{dependency}', dependenciesNotInstalled.join(', ')));
                    evalErrors();
                }
            }
}

module.exports = {
    execute() { //todo-imp: change to async
        //Load module api
        for (const moduleName of readdirSync(generic.path.files.modules))
            await addApiCalls('/', generic.path.files.moduleApi.replace('{modules}', generic.path.files.modules).replace('{name}', moduleName));

        //Load website api
        await addApiCalls('/', generic.path.files.api);

        return api;
    }
}