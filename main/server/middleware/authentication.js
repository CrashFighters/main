const firebase = require('../../../modules/authentication/functions/authentication.js');

// module.exports = async (request, response) => {
module.exports = async (request) => {
    const authToken = request.headers.authToken;

    if (!authToken)
        return { authenticated: false };

    try {
        const authentication = await firebase.auth().verifyIdToken(authToken);

        return {
            authenticated: true,
            authentication
        };
    } catch {
        return { authenticated: false };
    }
}