const getPermissions = require('../../../modules/authentication/getPermissions.js');

module.exports = {
    info: {
        requires: [
            'authentication'
        ]
    },
    async execute({ middlewareData, parseError }) {
        try {
            return { permissions: getPermissions(middlewareData.authentication) };
        } catch (e) {
            parseError(e);
        }
    }
}