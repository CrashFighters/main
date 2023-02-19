const https = require('https');

const secret = require('../credentials/recaptcha.json').private;
const {
    hostname,
    port,
    path,
    full
} = require('../credentials/recaptcha.json').endpoint;

const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': null
};

module.exports = {
    async execute({ params, end, statusCode, request, parseError }) {
        try {
            if (!params.token) return statusCode(400, 'No token provided');

            const postData = JSON.stringify({
                secret,
                response: params.token,
                remoteip: request.socket.remoteAddress
            });

            headers['Content-Length'] = postData.length;

            const response = await fetch(full, {
                method: 'POST',
                body: postData,
                headers
            });

            const result = await response.json();

            if (!result.success)
                if (result['error-codes'].includes('missing-input-secret') || result['error-codes'].includes('invalid-input-secret') || result['error-codes'].includes('bad-request'))
                    throw new Error(`Recaptcha: Server has invalid config: ${result['error-codes'].join(', ')}`);
                else if (result['error-codes'].includes('missing-input-response') || result['error-codes'].includes('invalid-input-response'))
                    return statusCode(400, 'Invalid token');
                else if (result['error-codes'].includes('timeout-or-duplicate'))
                    return statusCode(400, 'Token has expired or has already been used');
                else
                    return statusCode(400, 'Unknown error');

            end(JSON.stringify(result));

        } catch (e) {
            return parseError(e);
        }
    }
}