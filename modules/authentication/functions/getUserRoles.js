module.exports = (user) => {
    const userRoles = [];

    userRoles.push('roles:empty');
    userRoles.push('roles:default');
    if (user) userRoles.push('roles:authenticated');

    if (user?.customClaims?.roles)
        for (const role of user.customClaims.roles)
            userRoles.push(`customRoles:${role}`);

    return userRoles;
}