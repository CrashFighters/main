const getPermissions = require('../../../modules/authentication/functions/getPermissions.js');

module.exports = {
    info: {
        requires: [
            'authentication',
            'customClaims'
        ]
    },
    async execute({ middlewareData, parseError }) {
        try {
            return { permissions: getPermissions(middlewareData.authentication, middlewareData.customClaim) };
        } catch (e) {
            parseError(e);
        }
    }
}