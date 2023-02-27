const fs = require('fs');
const mime = require('mime-types');

const serverSideRenderHtml = require('../../functions/serverSideRenderHtml.js');
const getExtraHeaders = require('../../functions/extraHeaders.js');
const getExtraHtmlHeaders = require('../../functions/extraHtmlHeaders.js');

const publicFiles = {};

addPublicFiles('/', './publicFiles/')

// console.log(require('util').inspect(publicFiles, { colors: true, depth: 2 }))

module.exports = publicFiles;

function addPublicFiles(websitePath, path) {
    if (fs.existsSync(path))
        for (const name of fs.readdirSync(path)) {
            if (fs.statSync(path + name).isFile()) {
                let pathname = websitePath;
                if (name !== 'index.html') pathname += name;
                if (pathname.endsWith('/')) pathname = pathname.slice(0, -1);

                publicFiles[pathname] = getPublicFile(path + name);
            } else
                addPublicFiles(websitePath + name + '/', path + name + '/');
        }
}

function getPublicFile(path) {
    const contentType = mime.lookup(path);

    if (contentType === 'text/html') {
        const data = fs.readFileSync(path).toString()

        const finalData = serverSideRenderHtml(data, false);
        const extraHeaders = getExtraHeaders(false);
        const extraHtmlHeaders = getExtraHtmlHeaders({ data });

        return {
            statusCode: 200,
            headers: {
                ...extraHeaders,
                ...extraHtmlHeaders,
                'Content-Type': contentType,
                'Content-Length': Buffer.byteLength(finalData)
            },
            data: finalData
        }
    } else {
        const size = fs.statSync(path).size;

        const extraHeaders = getExtraHeaders(false);

        return {
            statusCode: 200,
            headers: {
                ...extraHeaders,
                'Content-Type': contentType,
                'Content-Length': size
            },
            data: null,
            path
        }
    }
}