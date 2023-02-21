const http = require('http');
const { generic: { port } } = require('./settings.json');

const server = http.createServer(require('./main/functions/error/lastFallback').serverExecute);

try {
    require('./main/functions/error/evalErrors').execute();
} catch (e) { }

server.listen(port);