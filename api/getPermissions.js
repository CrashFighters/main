const getPermission = require('../modules/authentication/functions/getPermission.js');

module.exports = {
    execute({ end, middlewareData, params, statusCode }) {
        if (!params.permission) return statusCode(400, 'noPermissionProvided', 'No permission provided');
        let permissionName;
        try {
            permissionName = JSON.parse(params.permission);
        } catch {
            return statusCode(400, 'invalidPermission', 'Invalid permission');
        };

        const permission = getPermission(permissionName, middlewareData.authentication.user, middlewareData.authentication.customClaims);
        if (permission === undefined) return statusCode(400, 'invalidPermission', 'Invalid permission');

        end(permission);
    }
}