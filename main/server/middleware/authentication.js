const firebase = require('../../../modules/authentication/functions/authentication.js');

module.exports = {
    async execute({ request, parseError }) {
        try {

            const explicitAuth = Boolean(request.headers['auth_token']);
            let authHeaders;
            if (explicitAuth)
                authHeaders = request.headers['auth_token'];
            else
                authHeaders = getAuthHeadersFromCookie(request.headers.cookie);

            const authToken = authHeaders?.['auth_token'];

            if (!authHeaders || !authToken)
                return { authenticated: false, explicitAuth };

            try {
                const authentication = await firebase.auth().verifyIdToken(authToken, true);

                return {
                    authenticated: true,
                    authentication,
                    explicitAuth
                };
            } catch {
                return {
                    authenticated: false,
                    authentication: null,
                    explicitAuth
                };
            }

        } catch (e) {
            parseError(e);
        }
    }
}

function getAuthHeadersFromCookie(cookie) {
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