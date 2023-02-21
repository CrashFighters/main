const fs = require('fs');
const mime = require('mime-types');

const statusCode = require('../functions/error/statusCode.js').execute;

module.exports = {
    // execute(request, response, middleWareData) {
    execute(request, response) {

        const path = require('../functions/urlToPath.js').execute(request.url);

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