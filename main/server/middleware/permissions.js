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
        return {
            hasPermission: (permission, { owner }) => {
                const checks = {
                    owner: owner === undefined ? undefined : owner === authentication.uid,
                    appCheck: appCheckPassed,
                    explicitAuth: explicitAuthentication
                };

                hasPermission(permission, checks, authentication, customClaims)
            }
        };
    }
}