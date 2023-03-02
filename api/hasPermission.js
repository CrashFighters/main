module.exports = {
    async execute({ end, middlewareData: { hasPermission }, params, statusCode, parseError }) {
        try {
            if (!params.permission) return statusCode(400, 'noPermissionProvided', 'No permission provided');
            let permissionName;
            try {
                permissionName = JSON.parse(params.permission);
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

            hasPermission = await hasPermission;

            end(hasPermission(permissionName, checks));
        } catch (e) {
            parseError(e);
        }
    }
}