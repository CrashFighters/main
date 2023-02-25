const getPermission = require('../modules/authentication/functions/getPermission.js');

module.exports = {
    execute({ end, params, statusCode, middlewareData }) {
        if (!params.permission) return statusCode(400, 'noPermissionProvided', 'No permission provided');

        end(JSON.stringify(getPermission(middlewareData.authentication, params.permission)));
    }
}