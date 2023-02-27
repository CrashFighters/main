const fs = require('fs');
const mime = require('mime-types');

const statusCode = require('../functions/error/statusCode.js').execute;
const serverSideRenderHtml = require('../functions/serverSideRenderHtml.js');
const getExtraHtmlHeaders = require('../functions/extraHtmlHeaders.js');
const getExtraHeaders = require('../functions/extraHeaders.js');

module.exports = {
    execute(request, response, { middlewareData: { getPermission, authentication } }) {

        const { publicPath, privatePath, localPath } = require('../functions/urlToPath.js').execute(request.url);
        const permissionParts = localPath.split('/').slice(1);

        const isPrivate = fs.existsSync(privatePath) && getPermission(['privateFiles', ...permissionParts], true) === 'always';
        const isPublic = fs.existsSync(publicPath);

        if ((!isPrivate) && (!isPublic))
            return statusCode(response, 404);

        respond({
            path: isPrivate ? privatePath : publicPath,
            response,
            request,
            privateFile: isPrivate,
            authentication
        });
    }
};

function respond({ path, response, request, privateFile, authentication }) {
    const contentType = mime.lookup(path);

    if (contentType === 'text/html') {
        const data = fs.readFileSync(path).toString()

        const finalData = serverSideRenderHtml(data, request, privateFile);
        const extraHeaders = getExtraHeaders(request, privateFile);
        const extraHtmlHeaders = getExtraHtmlHeaders({ data, request, privateFile, authentication });

        response.writeHead(200, {
            ...extraHeaders,
            ...extraHtmlHeaders,
            'Content-Type': contentType,
            'Content-Length': Buffer.byteLength(finalData)
        });

        response.end(finalData);
    } else {
        const size = fs.statSync(path).size;
        const readStream = fs.createReadStream(path);

        const extraHeaders = getExtraHeaders(request, privateFile);

        response.writeHead(200, {
            ...extraHeaders,
            'Content-Type': contentType,
            'Content-Length': size
        });

        readStream.pipe(response);
    }
}