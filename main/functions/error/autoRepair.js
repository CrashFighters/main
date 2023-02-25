const repairSettings = {
    jsonBeginEnd: [
        ['', '}'],
        ['{', ''],
        ['{', '}']
    ],
    projectDependencies: [
        'mime-types'
    ]
}

module.exports = {
    async execute(server) {
        const t = require(__filename);

        let changed = [];
        let logs = [];
        let currentReturn;

        server.close();

        currentReturn = await t.repairs.messages.main.fix();
        changed = changed.concat(currentReturn?.changed || [])
        logs = logs.concat(currentReturn?.logs || [])

        currentReturn = await t.repairs.modules.node_modules();
        changed = changed.concat(currentReturn?.changed || [])
        logs = logs.concat(currentReturn?.logs || [])

        return {
            changed,
            logs
        }

    },
    repairs: {
        messages: {
            main: {
                fix() {
                    const t = require(__filename);
                    if (!t.repairs.messages.main.test()) return;

                    const f = t.repairs.messages.main.fixes;

                    let changed = [];
                    let logs = [];
                    let currentReturn;

                    currentReturn = f.beginEnd('', '}');
                    changed = changed.concat(currentReturn.changed)
                    logs = logs.concat(currentReturn.logs)

                    currentReturn = f.beginEnd('{', '');
                    changed = changed.concat(currentReturn.changed)
                    logs = logs.concat(currentReturn.logs)

                    currentReturn = f.beginEnd('{', '}');
                    changed = changed.concat(currentReturn.changed)
                    logs = logs.concat(currentReturn.logs)

                    return {
                        changed,
                        logs
                    };
                },
                test() {
                    const settings = require('../../../settings.json');
                    const fs = require('fs');

                    try {
                        const messages = fs.readdirSync(settings.generic.path.files.messages);

                        messages.forEach(val => {
                            JSON.parse(fs.readFileSync(`${settings.generic.path.files.messages}${val}`));
                        })

                        return false;
                    } catch {
                        return true;
                    }
                },
                fixes: {
                    beginEnd(begin, end) {
                        const settings = require('../../../settings.json');
                        const fs = require('fs');
                        const messages = fs.readdirSync(settings.generic.path.files.messages);

                        const changed = [];
                        const logs = [];

                        messages.forEach(val => {
                            try {
                                JSON.parse(`${fs.readFileSync(`${settings.generic.path.files.messages}${val}`)}`);
                            } catch {

                                try {
                                    JSON.parse(`${begin}${fs.readFileSync(`${settings.generic.path.files.messages}${val}`)}${end}`);

                                    fs.writeFileSync(`${settings.generic.path.files.messages}${val}`, `${begin}${fs.readFileSync(`${settings.generic.path.files.messages}${val}`)}${end}`);
                                    changed.push({
                                        tag: 'changedJson',
                                        begin,
                                        end
                                    })

                                } catch (err) {
                                    logs.push({
                                        tag: 'error',
                                        value: err
                                    })
                                }
                            }
                        });

                        return {
                            changed,
                            logs
                        }

                    }
                }
            }
        },
        modules: {
            async node_modules() {
                const changed = [];
                const logs = [];
                try {
                    const settings = require('../../../settings.json');
                    const fs = require('fs');

                    const installModules = [];

                    const installModule = name => {
                        try {
                            require.resolve(name)
                        } catch {
                            installModules.push(name);
                            changed.push({
                                tag: 'installedNodeModule',
                                value: name
                            });
                        }
                    }

                    repairSettings.projectDependencies.forEach(val => {
                        installModule(val);
                    })

                    const modules = fs.readdirSync(settings.generic.path.files.modules);
                    modules.forEach(val => {

                        const extraDependenciesPath = `${settings.generic.path.files.modules}${val}/${settings.generic.path.files.extraDependencies}`;
                        console.log(extraDependenciesPath)
                        if (fs.existsSync(extraDependenciesPath)) {
                            try {
                                const extraDependencies = require(extraDependenciesPath);

                                if (extraDependencies?.node_modules)
                                    extraDependencies.node_modules.forEach(val => {
                                        installModule(val)
                                    })
                            } catch (err) {
                                logs.push({
                                    tag: 'error',
                                    value: err
                                })
                            }
                        }

                        const apiPath = settings.generic.path.files.moduleApi.replace('{modules}', settings.generic.path.files.modules).replace('{name}', val);
                        if (fs.existsSync(apiPath)) {
                            const apis = fs.readdirSync(apiPath);
                            apis.forEach(api => {
                                try {
                                    const apiFile = require(`../../.${settings.generic.path.files.moduleApi.replace('{modules}', settings.generic.path.files.modules).replace('{name}', val)}${api}`);
                                    if (apiFile.dependencies?.node_modules) {
                                        apiFile.dependencies.node_modules.forEach(val => {
                                            installModule(val);
                                        })
                                    }
                                } catch (err) {
                                    logs.push({
                                        tag: 'error',
                                        value: err
                                    })
                                }
                            })
                        }
                    })

                    if (installModules)
                        await require('../installNodeModule').execute(installModules)

                    return {
                        changed,
                        logs
                    }
                } catch (err) {
                    return {
                        changed,
                        logs: [{
                            tag: 'error',
                            value: err
                        }]
                    }
                }
            }
        }
    }
}