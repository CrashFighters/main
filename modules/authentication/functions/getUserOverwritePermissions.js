module.exports = (user, customClaims) => {
    if (customClaims?.permissions)
        return customClaims.permissions;
    else
        return {};
}