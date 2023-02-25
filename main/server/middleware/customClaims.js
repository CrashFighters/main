const firebase = require('../../../modules/authentication/functions/authentication.js');

module.exports = {
    info: {
        requires: ['authentication']
    },
    async execute({ parseError, middlewareData: { authentication } }) {
        try {
            if (!authentication) return { customClaims: {} };

            const firebaseUser = await firebase.auth().getUser(authentication.sub);
            const customClaims = firebaseUser.customClaims;
            return { customClaims };
        } catch (e) {
            parseError(e);
        }
    }
}