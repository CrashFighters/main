const getPermissions = require('./getPermissions.js');

module.exports = (_permissionParts, user, customClaims) => {
    let currentPermission = getPermissions(user, customClaims);

    let permissionParts = _permissionParts;
    if (typeof permissionParts === 'string')
        permissionParts = permissionParts.split('.');

    for (const permissionPart of permissionParts)
        if (typeof currentPermission !== 'object')
            return currentPermission;
        else
            currentPermission = currentPermission[permissionPart];

    return currentPermission;
}