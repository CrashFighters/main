const getUserRoles = require('./getUserRoles.js');
const getRolePermissions = require('./getRolePermissions.js');
const getUserOverwritePermissions = require('./getUserOverwritePermissions.js');
const combinePermissions = require('./combinePermissions.js');

module.exports = (user) => {
    const userRoles = getUserRoles(user);
    const userRolePermissions = userRoles.map(getRolePermissions);
    const userOverwritePermissions = getUserOverwritePermissions(user);
    const userPermissions = combinePermissions([...userRolePermissions, userOverwritePermissions]);

    return userPermissions;
}