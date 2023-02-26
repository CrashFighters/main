const getPermission = require('../../../modules/authentication/functions/getPermission.js');

module.exports = {
    info: {
        requires: [
            'authentication',
            'customClaims'
        ]
    },
    execute({ middlewareData }) {
        return {
            getPermission: permission =>
                getPermission(permission, middlewareData.authentication, middlewareData.customClaims)
        };
    }
}