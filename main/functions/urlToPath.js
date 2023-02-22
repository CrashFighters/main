const url = require('url');
const pathLib = require('path');

module.exports = {
    execute(p) {
        let path = url.parse(p).pathname;

        if (!path.split('/').at(-1).includes('.')) {
            if (!path.endsWith('/'))
                path = `${path}/`;

            path = `${path}index.html`;
        };

        path = pathLib.resolve(__dirname, `../../files${path}`);

        return path;
    }
}