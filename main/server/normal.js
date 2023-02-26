const fs = require('fs');
const mime = require('mime-types');

const statusCode = require('../functions/error/statusCode.js').execute;
const getPermission = require('../../modules/authentication/functions/getPermission.js');

module.exports = {
    execute(request, response, { middlewareData }) {

        const { publicPath, privatePath, localPath } = require('../functions/urlToPath.js').execute(request.url);
        const permissionParts = localPath.split('/').slice(1);

        if (fs.existsSync(privatePath) && getPermission(['privateFiles', ...permissionParts], middlewareData?.authentication, middlewareData?.customClaims) === 'always')
            respond(privatePath, response, true);
        else if (fs.existsSync(publicPath))
            respond(publicPath, response, false);
        else
            statusCode(response, 404);
    }
};

function respond(path, response, privateFile) {
    const contentType = mime.lookup(path);

    if (contentType === 'text/html') {
        const data = fs.readFileSync(path).toString()
        const finalData = data + (privateFile ? '<script>window.privateFile = true;</script>' : '');

        response.writeHead(200, {
            'Content-Type': contentType,
            'Content-Length': Buffer.byteLength(finalData)
        });

        response.end(finalData);
    } else {
        const size = fs.statSync(path).size;
        const readStream = fs.createReadStream(path);

        response.writeHead(200, {
            'Content-Type': contentType,
            'Content-Length': size
        });

        readStream.pipe(response);
    }
}