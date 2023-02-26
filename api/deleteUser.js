const firebase = require('../modules/authentication/functions/authentication.js');

module.exports = {
    async execute({ end, middlewareData: { authentication, explicitAuthentication }, statusCode, parseError }) {
        try {
            if (!authentication) return statusCode(401, 'unauthorized', 'Unauthorized');
            if (!explicitAuthentication) return statusCode(401, 'unauthorized', 'Unauthorized');
            const auth = firebase.auth();

            const authTime = new Date(authentication.auth_time * 1000);
            const authAge = (new Date().getTime() - authTime.getTime()) / 1000; // authAge in seconds

            if (authAge > 5 * 60) return statusCode(403, 'oldLogin', 'The login is too old, login again');

            await auth.deleteUser(authentication.uid);

            end();
        } catch (e) {
            parseError(e);
        }
    }
}