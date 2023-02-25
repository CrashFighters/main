const { roles } = require('../../../settings.json').permissions;

module.exports = (user, permission) => {
    console.log(user)

    return false;
}