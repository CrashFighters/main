const { client_id } = require('../../../credentials/googleClientId.json');

const { setCredential } = require('../../../api/getGoogleSignInCredential.js');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(client_id);

module.exports = async ({ extraData, parseError }) => {
    try {

        if (!extraData.body?.g_csrf_token) return;

        const { credential, clientId, g_csrf_token } = extraData.body;

        //todo: add error handling with invalid token instead of server error
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: clientId
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];

        setCredential(g_csrf_token, credential);

        return { googleUserId: userid }

    } catch (e) {
        parseError(e);
    }
}