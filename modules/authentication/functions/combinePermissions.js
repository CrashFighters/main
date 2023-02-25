module.exports = combinePermissions;

function combinePermissions(permissions) {
    let currentPermissions = {};

    for (const permission of permissions)
        currentPermissions = combinePermissionsRecursive(currentPermissions, permission);

    return currentPermissions;
}

function combinePermissionsRecursive(oldPermissions, newPermissions) {
    if (typeof oldPermissions !== 'object') return newPermissions;
    else if (typeof oldPermissions === 'object' && typeof newPermissions !== 'object')
        return setPermissionsRecursive(oldPermissions, newPermissions);
    else if (typeof oldPermissions === 'object' && typeof newPermissions === 'object') {

        const currentPermissions = Object.assign({}, oldPermissions);

        for (const [name, newPermission] of Object.entries(newPermissions))
            currentPermissions[name] = combinePermissionsRecursive(currentPermissions[name], newPermission);

        return currentPermissions;

    } else
        throw new Error(`Don't know how to combine ${typeof currentPermission} and ${typeof newPermission}`)
}

function setPermissionsRecursive(o, permission) {
    if (typeof o !== 'object') return permission;
    const obj = Object.assign({}, o);

    for (const [name, value] of Object.entries(obj))
        obj[name] = setPermissionsRecursive(value, permission);

    return obj;
}