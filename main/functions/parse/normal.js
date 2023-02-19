const fs = require('fs');
const settings = require('../../../settings.json');

module.exports = {
    execute(p) {
        let path = p;

        if (path.includes('$'))
            path = path.split('$')[0]

        if (path.includes('?')) //Als params
            path = path.split('?')[0] //Verwijder params van path

        let orgPath = path;

        if (
            path.split('/')[1]
            &&
            path.split('/')[2]
        ) {
            if (
                path.split('/')[1]
                ==
                path.split('/')[2]
            ) {
                path =
                    '/' +
                    path
                        .split('/')
                        .splice(2)
                        .join('/')
            }
        }

        if (
            !path
                .split('/')[path
                    .split('/')
                    .length - 1
            ]
                .includes('.')
        ) {
            if (!path.endsWith('/'))
                path = `${path}/`
            path = `${path}index.html`
        }

        path = `${settings.generic.path.files.files}${path}`;

        if (!fs.existsSync(path)) {
            let newPath =
                '/' +
                orgPath
                    .split('/')
                    .splice(2)
                    .join('/');

            if (!newPath
                .split('/')[newPath
                    .split('/')
                    .length - 1
            ]
                .includes('.')
            ) {
                if (!newPath.endsWith('/')) newPath = `${newPath}/`;
                newPath = `${path}index.html`;
            }
            newPath = `${settings.generic.path.files.files}${newPath}`;
            if (fs.existsSync(newPath)) path = newPath;
        }

        return path;
    }
}