const firebase = require('./getFirebase.js');
const fs = require('fs');
const path = require('path');

async function getConfig(group) {
    if (group && fs.existsSync(path.resolve(__dirname, `../cache/group_${group}.json`)))
        return JSON.parse(fs.readFileSync(path.resolve(__dirname, `../cache/group_${group}.json`)).toString());
    else if ((!group) && fs.existsSync(path.resolve(__dirname, '../cache/noGroup.json')))
        return JSON.parse(fs.readFileSync(path.resolve(__dirname, '../cache/noGroup.json')).toString());

    let template;
    if (group)
        template = (await firebase.remoteConfig().getTemplate()).parameterGroups[group].parameters;
    else
        template = (await firebase.remoteConfig().getTemplate()).parameters;

    if (!template)
        return {};

    for (const [key, value] of Object.entries(template)) {
        if (value.valueType === 'JSON')
            template[key] = JSON.parse(value.defaultValue?.value);
        else if (value.valueType === 'STRING')
            template[key] = value.defaultValue?.value;
        else
            throw new Error(`Remote-config valueType ${value.valueType} not implemented`)
    }

    if (group)
        fs.writeFileSync(path.resolve(__dirname, `../cache/group_${group}.json`), JSON.stringify(template));
    else
        fs.writeFileSync(path.resolve(__dirname, '../cache/noGroup.json'), JSON.stringify(template));

    return template;
}

module.exports = getConfig;