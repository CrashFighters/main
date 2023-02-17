const http = require('http');
const settings = require('./settings.json');

let server;

server = http.createServer(                         				//Create server
	require('./main/functions/error/lastFallback').serverExecute	//Error handler
);

try {

	//Evaluate errors
	require('./main/functions/error/evalErrors').execute();

} catch (e) { }

const port = process.env.PORT  || settings.generic.port;

server.listen(port);

console.log(`Listening on port ${port}`);