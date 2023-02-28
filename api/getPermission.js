module.exports = {
    async execute({ end, middlewareData: { getPermission }, params, statusCode, parseError }) {
        try {
            if (!params.permission) return statusCode(400, 'noPermissionProvided', 'No permission provided');
            let permissionName;
            try {
                permissionName = JSON.parse(params.permission);
            } catch {
                return statusCode(400, 'invalidPermission', 'Invalid permission');
            };

            getPermission = await getPermission;
            const permission = getPermission(permissionName);
            if (permission === undefined) return statusCode(400, 'invalidPermission', 'Invalid permission');

            end(permission);
        } catch (e) {
            parseError(e);
        }
    }
}