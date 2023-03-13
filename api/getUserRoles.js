const getUserRoles = require('../modules/authentication/functions/getUserRoles.js');

module.exports = {
    async execute({ end, middlewareData: { authentication, customClaims }, parseError }) {
        try {
            end(JSON.stringify(getUserRoles(authentication.user, customClaims)));
        } catch (e) {
            await parseError(e);
        }
    }
}