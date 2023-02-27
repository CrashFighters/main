module.exports = combinePermissions;

function combinePermissions(permissions) {
    let currentPermissions = {};

    for (const permission of permissions)
        currentPermissions = combinePermissionsRecursive(currentPermissions, permission);

    return currentPermissions;
}

function combinePermissionsRecursive(oldPermissions, newPermissions) {
    if (typeof newPermissions === 'object' &&
        Object.keys(newPermissions).length === 0) return oldPermissions;

    if (oldPermissions === undefined) return newPermissions;
    if (newPermissions === undefined) return oldPermissions;

    if (typeof oldPermissions !== 'object' && typeof newPermissions === 'object')
        return {
            _other: oldPermissions,
            ...newPermissions
        };
    else if (typeof oldPermissions !== 'object' && typeof newPermissions !== 'object')
        return newPermissions;
    else if (typeof oldPermissions === 'object' && typeof newPermissions !== 'object')
        return newPermissions;
    else if (typeof oldPermissions === 'object' && typeof newPermissions === 'object') {

        const currentPermissions = Object.assign({}, oldPermissions);

        for (const [name, newPermission] of Object.entries(newPermissions))
            currentPermissions[name] = combinePermissionsRecursive(currentPermissions[name], newPermission);

        return currentPermissions;

    } else
        throw new Error(`Don't know how to combine ${typeof currentPermission} and ${typeof newPermission}`)
}