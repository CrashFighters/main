const getPermissions = require('../modules/authentication/functions/getPermissions.js');

module.exports = {
    execute({ end, middlewareData }) {
        end(JSON.stringify(getPermissions(middlewareData.authentication)));
    }
}