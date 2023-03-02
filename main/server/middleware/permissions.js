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
        //todo: add appCheck to checks
        //todo: add explicitAuthentication to checks

        return {
            hasPermission: (permission, { owner }, allowCookie) => {
                const checks = {
                    ifOwner: explicitAuthentication && owner === authentication.uid
                };

                hasPermission(permission, checks, (explicitAuthentication || allowCookie) ? authentication : undefined, (explicitAuthentication || allowCookie) ? customClaims : undefined)
            }
        };
    }
}