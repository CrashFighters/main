module.exports = combinePermissions;

function combinePermissions(permissions) {
    let currentPermissions = {};

    for (const permission of permissions)
        currentPermissions = combinePermissionsRecursive(currentPermissions, permission);

    return currentPermissions;
}

function combinePermissionsRecursive(oldPermissions, newPermissions) {
    const currentPermissions = Object.assign({}, oldPermissions);

    for (const [name, newPermission] of Object.entries(newPermissions)) {
        const currentPermission = currentPermissions[name];

        if (typeof currentPermission !== 'object')
            currentPermissions[name] = newPermission;
        else if (typeof currentPermission === 'object' && typeof newPermission === 'object')
            currentPermissions[name] = combinePermissionsRecursive(currentPermission, newPermission);
        else if (typeof currentPermission === 'object' && typeof newPermission !== 'object')
            currentPermissions[name] = setPermissionsRecursive(currentPermission, newPermission);
        else
            throw new Error(`Don't know how to combine ${typeof currentPermission} and ${typeof newPermission}`)
    }

    return currentPermissions;
}

function setPermissionsRecursive(o, permission) {
    const obj = Object.assign({}, o);

    for (const [name, value] of Object.entries(obj))
        if (typeof value === 'object')
            obj[name] = setPermissionsRecursive(value, permission);
        else
            obj[name] = permission;

    return obj;
}