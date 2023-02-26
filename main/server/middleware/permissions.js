const getPermission = require('../../../modules/authentication/functions/getPermission.js');

module.exports = {
    info: {
        requires: [
            'authentication',
            'customClaims'
        ]
    },
    execute({ middlewareData: { authentication, explicitAuthentication, customClaims } }) {
        return {
            getPermission: permission =>
                getPermission(permission, explicitAuthentication ? authentication : undefined, explicitAuthentication ? customClaims : undefined)
        };
    }
}