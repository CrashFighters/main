module.exports = ({ extraData }) => {
    if (!extraData.body?.g_csrf_token) return {};

    const { credential, clientId } = extraData.body;

    return { googleSignInCredential: credential, googleSignInClientId: clientId }
}