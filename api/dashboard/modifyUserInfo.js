const firebase = require('../../modules/authentication/functions/authentication.js');
const possibleProperties = Object.freeze({
    email: 'email',
    emailVerified: 'emailVerified',
    phoneNumber: 'phoneNumber',
    password: 'password',
    displayName: 'displayName',
    picture: 'photoURL'
});

module.exports = {
    async execute({ params, statusCode, parseError, end, middlewareData: { getPermission, authentication, explicitAuthentication } }) {
        try {
            if (!params.user) return statusCode(400, 'noUserProved', 'No user provided');

            let properties = params.properties;
            if (!properties) return statusCode(400, 'noPropertiesProvided', 'No properties provided');
            try {
                properties = JSON.parse(properties);
            } catch {
                return statusCode(400, 'invalidProperties', 'Invalid properties');
            }

            const newProperties = {};

            getPermission = await getPermission;
            authentication = await authentication;
            explicitAuthentication = await explicitAuthentication;
            for (const [key, value] of Object.entries(properties)) {
                if (!possibleProperties[key]) return statusCode(400, 'unknownProperty', `Unknown property ${key}`);

                const permission = getPermission(['dashboard', 'modify', 'userInfo', key]);
                const userHasPermission = hasPermission(permission, explicitAuthentication, authentication, params);

                if (!userHasPermission) return statusCode(403, 'invalidPermission', `Invalid permission to modify ${key} (dashboard.modify.userInfo.${key}))`);

                if (key === 'email') {
                    const emailVerifiedPermission = getPermission('dashboard.modify.userInfo.emailVerified');
                    const userHasEmailVerifiedPermission = hasPermission(emailVerifiedPermission, explicitAuthentication, authentication, params);

                    if (!userHasEmailVerifiedPermission)
                        newProperties.emailVerified = false;
                }

                newProperties[possibleProperties[key]] = value;
            }

            const auth = firebase.auth();
            try {
                await auth.updateUser(params.user, newProperties);
            } catch (e) {
                return statusCode(400, e?.code || 'invalidArguments', e?.message || 'Invalid arguments');
            }

            end();

        } catch (e) {
            parseError(e)
        }
    }
}

function hasPermission(permission, explicitAuthentication, authentication, params) {
    if (permission === 'always')
        return true;
    else if (permission === 'ifOwner')
        return explicitAuthentication && authentication.uid === params.user;
    else if (permission === 'never')
        return false;
    else
        throw new Error(`Don't know how to handle permission ${permission}`);
}