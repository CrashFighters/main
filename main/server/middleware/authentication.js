const firebase = require('../../../modules/authentication/functions/authentication.js');

module.exports = {
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
    let authHeaders = cookie.split(';').find(c => c.trim().startsWith('authHeaders='));
    if (!authHeaders) return null;

    authHeaders = authHeaders.split('=')[1];
    try {
        authHeaders = JSON.parse(authHeaders);
    } catch {
        return null;
    }

    return authHeaders;
}