module.exports = (user) => {
    if (user?.customClaims?.permissions)
        return user.customClaims.permissions;
    else
        return {};
}