const fs = require('fs');
const mime = require('mime-types');

const statusCode = require('../functions/error/statusCode.js').execute;
const serverSideRenderHtml = require('../functions/serverSideRenderHtml.js');

module.exports = {
    execute(request, response, { middlewareData: { getPermission } }) {

        const { publicPath, privatePath, localPath } = require('../functions/urlToPath.js').execute(request.url);
        const permissionParts = localPath.split('/').slice(1);

        if (fs.existsSync(privatePath) && getPermission(['privateFiles', ...permissionParts], true) === 'always')
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
        const finalData = serverSideRenderHtml(data, privateFile);

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