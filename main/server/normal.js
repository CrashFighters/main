const fs = require('fs');
const mime = require('mime-types');

const statusCode = require('../functions/error/statusCode.js').execute;
const serverSideRenderHtml = require('../functions/serverSideRenderHtml.js');
const getExtraHtmlHeaders = require('../functions/extraHtmlHeaders.js');
const getExtraHeaders = require('../functions/extraHeaders.js');

const publicFiles = require('../setup/preload/publicFiles.js');

module.exports = {
    async execute(request, response, { middlewareData: { getPermission } }) {

        const { publicPath, privatePath, localPath } = require('../functions/urlToPath.js').execute(request.url);
        const permissionParts = localPath.split('/').slice(1);

        let isPrivate = false;
        if (fs.existsSync(privatePath)) {
            getPermission = await getPermission;
            isPrivate = getPermission(['privateFiles', ...permissionParts], true) === 'always';
        };
        const isPublic = fs.existsSync(publicPath);

        if ((!isPrivate) && (!isPublic))
            return statusCode(response, 404);

        respond({
            path: isPrivate ? privatePath : publicPath,
            response,
            request,
            privateFile: isPrivate
        });
    }
};

function respond({ path, response, request, privateFile }) {
    let pathname = request.url.split('?')[0];
    if (pathname.endsWith('/')) pathname = pathname.slice(0, -1);

    if (!privateFile && publicFiles[pathname]) {
        const { statusCode, headers, data, path } = publicFiles[pathname];
        response.writeHead(statusCode, headers);

        if (data)
            response.end(data);
        else
            fs.createReadStream(path).pipe(response);
        return
    }

    console.log(pathname)

    const contentType = mime.lookup(path);

    if (contentType === 'text/html') {
        const data = fs.readFileSync(path).toString()

        const finalData = serverSideRenderHtml(data, privateFile);
        const extraHeaders = getExtraHeaders(privateFile);
        const extraHtmlHeaders = getExtraHtmlHeaders({ data });

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

        const extraHeaders = getExtraHeaders(privateFile);

        response.writeHead(200, {
            ...extraHeaders,
            'Content-Type': contentType,
            'Content-Length': size
        });

        readStream.pipe(response);
    }
}