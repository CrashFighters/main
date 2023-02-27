const firebase = require('../../../modules/authentication/functions/authentication.js');

module.exports = {
    async execute({ params, statusCode, parseError, end, middlewareData: { getPermission } }) {
        try {

            getPermission = await getPermission;
            const permission = await getPermission('dashboard.getUserFrom.email');

            let hasPermission;
            if (permission === 'always')
                hasPermission = true;
            else if (permission === 'never')
                hasPermission = false;
            else
                throw new Error(`Don't know how to handle permission: ${permission}`);

            if (!params.email) return statusCode(400, 'noEmailProvided', 'No email provided');
            if (!hasPermission) return statusCode(403, 'invalidPermission', 'Invalid permission (dashboard.getUserFrom.email)');

            const auth = firebase.auth();
            let user;
            try {
                user = await auth.getUserByEmail(params.email);
            } catch {
                return statusCode(404, 'noUserFound', 'No user found');
            }

            end(user.uid);

        } catch (e) {
            parseError(e)
        }
    }
}