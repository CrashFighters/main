const hasPermission = require('../../../modules/authentication/functions/hasPermission.js');

module.exports = {
    info: {
        exports: ['hasPermission'],
        requires: [
            'authentication',
            'customClaims'
        ]
    },
    execute({ middlewareData: { authentication, explicitAuthentication, customClaims } }) {
        return {
            hasPermission: (permission, checks, allowCookie) =>
                hasPermission(permission, checks, (explicitAuthentication || allowCookie) ? authentication : undefined, (explicitAuthentication || allowCookie) ? customClaims : undefined)
        };
    }
}