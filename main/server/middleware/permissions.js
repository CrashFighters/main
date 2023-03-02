const hasPermission = require('../../../modules/authentication/functions/hasPermission.js');

module.exports = {
    info: {
        exports: ['hasPermission'],
        requires: [
            'authentication',
            'customClaims',
            'appCheck'
        ]
    },
    execute({ middlewareData: { authentication, explicitAuthentication, customClaims, appCheckPassed } }) {
        //todo: add explicitAuthentication to checks

        return {
            hasPermission: (permission, { owner }, allowCookie) => {
                const checks = {
                    owner: owner === undefined ? undefined : explicitAuthentication && owner === authentication.uid,
                    appCheck: appCheckPassed
                };

                hasPermission(permission, checks, (explicitAuthentication || allowCookie) ? authentication : undefined, (explicitAuthentication || allowCookie) ? customClaims : undefined)
            }
        };
    }
}