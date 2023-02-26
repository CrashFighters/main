const firebase = require('../../../modules/authentication/functions/authentication.js');

module.exports = {
    async execute({ params, statusCode, parseError, end, middlewareData: { getPermission } }) {
        try {
            const permission = await getPermission('dashboard.getUserFrom.phoneNumber');
            let hasPermission;
            if (permission === 'always')
                hasPermission = true;
            else if (permission === 'never')
                hasPermission = false;
            else
                throw new Error(`Don't know how to handle permission: ${permission}`);

            if (!params.phoneNumber) return statusCode(400, 'noPhoneNumberProvided', 'No phone number provided');
            if (!hasPermission) return statusCode(403, 'invalidPermission', 'Invalid permission (dashboard.getUserFrom.phoneNumber)');

            const auth = firebase.auth();
            let user;
            try {
                user = await auth.getUserByPhoneNumber(params.phoneNumber);
            } catch {
                return statusCode(404, 'noUserFound', 'No user found');
            }

            end(user.uid);

        } catch (e) {
            parseError(e)
        }
    }
}