const firebase = require('../../../modules/authentication/functions/authentication.js');
const parseCookie = require('../../functions/parse/cookie.js');

module.exports = {
    info: {
        exports: ['authenticated', 'authentication', 'explicitAuthentication']
    },
    async execute({ request, parseError }) {
        try {

            const explicitAuthentication = Boolean(request.headers['auth_token']); // todo: rename to explicitlyAuthenticated
            let authHeaders;
            if (explicitAuthentication)
                authHeaders = request.headers;
            else
                authHeaders = getAuthHeadersFromCookie(request.headers.cookie);

            const authToken = authHeaders?.['auth_token'];

            if ((!authHeaders) || (!authToken))
                return { authenticated: false, authentication: null, explicitAuthentication };

            try {
                const authentication = await firebase.auth().verifyIdToken(authToken, true);

                return {
                    authenticated: true,
                    authentication,
                    explicitAuthentication
                };
            } catch {
                return {
                    authenticated: false,
                    authentication: null,
                    explicitAuthentication
                };
            }

        } catch (e) {
            parseError(e);
        }
    }
}

function getAuthHeadersFromCookie(cookie) {
    if (!cookie) return null;
    let authHeaders = parseCookie(cookie).authHeaders;
    if (!authHeaders) return null;

    try {
        authHeaders = JSON.parse(authHeaders);
    } catch {
        return null;
    }

    return authHeaders;
}