const getUserRoles = require('./getUserRoles.js');
const getRolePermissions = require('./getRolePermissions.js');
const combinePermissions = require('./combinePermissions.js');

module.exports = (user) => {
    const userRoles = getUserRoles(user);
    const userRolePermissions = userRoles.map(getRolePermissions);
    const userPermissions = combinePermissions(userRolePermissions);

    return userPermissions;
}