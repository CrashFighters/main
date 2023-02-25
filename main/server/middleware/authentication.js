const firebase = require('../../../modules/authentication/functions/authentication.js');

module.exports = {
    async execute({ request, parseError }) {
        try {

            const authToken = request.headers['auth_token'];

            if (!authToken)
                return { authenticated: false };

            try {
                const authentication = await firebase.auth().verifyIdToken(authToken, true);

                return {
                    authenticated: true,
                    authentication
                };
            } catch {
                return {
                    authenticated: false,
                    authentication: null
                };
            }

        } catch (e) {
            parseError(e);
        }
    }
}