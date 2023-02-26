const fs = require('fs');
const mime = require('mime-types');

const statusCode = require('../functions/error/statusCode.js').execute;

module.exports = {
    // execute(request, response, {middlewareData, extraData}) {
    execute(request, response) {

        const { publicPath, privatePath } = require('../functions/urlToPath.js').execute(request.url);
        const path = publicPath;
        //todo

        if (fs.existsSync(path))
            fs.readFile(path, async (err, data) => {
                if (err) throw err;

                response.writeHead(200, { 'Content-Type': mime.lookup(path) });
                return response.end(data);
            });
        else
            statusCode(response, 404);
    }
};