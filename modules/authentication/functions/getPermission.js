const getPermissions = require('./getPermissions.js');

module.exports = (_permissionParts, user, customClaims) => {
    let permissionParts = _permissionParts;
    if (typeof permissionParts === 'string')
        permissionParts = permissionParts.split('.');

    const fullPermissions = getPermissions(user, customClaims);
    let currentPermission = fullPermissions;

    for (const permissionPartIndex in permissionParts) {
        const permissionPart = permissionParts[permissionPartIndex];

        if (typeof currentPermission !== 'object') {
            return currentPermission ?? getPermissionFromUndefined(fullPermissions, permissionParts.slice(0, permissionPartIndex));
        } else
            currentPermission = currentPermission[permissionPart];
    }

    if (typeof currentPermission === 'object')
        throw new Error(`Permission ${_permissionParts} is object (${require('util').inspect(currentPermission)}`)
    else
        return currentPermission ?? getPermissionFromUndefined(fullPermissions, permissionParts);
}

function getPermissionFromUndefined(permissions, permissionParts) {
    const permission = getObjectValueFromPropertyArray(permissions, permissionParts);

    if (permission?._other)
        return permission._other;
    else
        return 'never';
}

function getObjectValueFromPropertyArray(object, propertyArray) {
    let currentObject = object;

    for (const property of propertyArray) {
        if (typeof currentObject !== 'object')
            return currentObject;
        else
            currentObject = currentObject[property];
    }

    return currentObject;
}