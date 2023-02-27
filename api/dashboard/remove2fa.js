const firebase = require('../../modules/authentication/functions/authentication.js');

module.exports = {
    async execute({ params, statusCode, parseError, end, middlewareData: { getPermission, authentication, explicitAuthentication } }) {
        try {
            if (!params.user) return statusCode(400, 'noUserProved', 'No user provided');

            const permission = getPermission('dashboard.remove.2fa');
            let hasPermission;
            if (permission === 'always')
                hasPermission = true;
            else if (permission === 'ifOwner')
                hasPermission = explicitAuthentication && authentication.uid === params.user;
            else if (permission === 'never')
                hasPermission = false;
            else
                throw new Error(`Don't know how to handle permission ${permission}`);

            if (!hasPermission) return statusCode(403, 'invalidPermission', 'Invalid permission to remove 2fa (dashboard.remove.2fa)');

            const auth = firebase.auth();
            try {
                await auth.updateUser(params.user, {
                    multiFactor: {
                        enrolledFactors: []
                    }
                });
            } catch {
                return statusCode(400, 'invalidUser', 'Invalid user');
            }

            end();

        } catch (e) {
            parseError(e)
        }
    }
}