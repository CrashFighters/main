const getPermissions = require('./getPermissions.js');

module.exports = (_permissionParts, user, customClaims) => {
    const fullPermissions = getPermissions(user, customClaims);
    let currentPermission = fullPermissions;

    let permissionParts = _permissionParts;
    if (typeof permissionParts === 'string')
        permissionParts = permissionParts.split('.');

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
    for (let ii = permissionParts.length; ii >= 0; ii--) {
        const currentPermission = getObjectValueFromPropertyArray(permissions, permissionParts.slice(0, ii));

        if (currentPermission?._other) return currentPermission._other;
    }

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