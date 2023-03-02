const hasPermission = require('../modules/authentication/functions/hasPermission.js');

module.exports = {
    async execute({ end, middlewareData: { authentication, customClaims }, params, statusCode, parseError }) {
        try {
            if (!params.permission) return statusCode(400, 'noPermissionProvided', 'No permission provided');
            let permissionParts;
            try {
                permissionParts = JSON.parse(params.permission);
            } catch {
                return statusCode(400, 'invalidPermission', 'Invalid permission');
            };

            if (!params.checks) return statusCode(400, 'noChecksProvided', 'No checks provided');
            let checks;
            try {
                checks = JSON.parse(params.checks);
            } catch {
                return statusCode(400, 'invalidChecks', 'Invalid checks');
            };

            authentication = await authentication;
            customClaims = await customClaims;

            //todo-imp: use hasPermission function from middlewareData
            end(hasPermission(permissionParts, checks, authentication, customClaims));
        } catch (e) {
            parseError(e);
        }
    }
}