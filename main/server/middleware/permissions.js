const getPermission = require('../../../modules/authentication/functions/getPermission.js');

module.exports = {
    info: {
        exports: ['getPermission'],
        requires: [
            'authentication',
            'customClaims'
        ]
    },
    execute({ middlewareData: { authentication, explicitAuthentication, customClaims } }) {
        return {
            getPermission: (permission, allowCookie) =>
                getPermission(permission, (explicitAuthentication || allowCookie) ? authentication : undefined, (explicitAuthentication || allowCookie) ? customClaims : undefined)
        };
    }
}