const getPermission = require('./getPermission.js');

module.exports = (permissionParts, checks, user, customClaims) => {
    let permission = getPermission(permissionParts, user, customClaims);
    if (typeof permission === 'string') permission = [permission];

    checks = {
        ...(checks || {}),
        always: true,
        never: false
    };

    for (const requirement of permission)
        if (!checks[requirement])
            return false;

    return true;
}