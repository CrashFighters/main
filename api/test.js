const settings = require('../settings.json')
// const authentication = require(`../${settings.generic.path.files.modules}authentication/functions/authentication.js`);
const { get, set } = require(`../${settings.generic.path.files.modules}database/functions/database.js`);

module.exports = {
    execute({ end }) {
        set({
            users: [{
                id: 0,
                name: 'oscar5123',
                settings: {
                    language: 'en',
                    displayName: 'Oscar'
                }
            }],
            communities: [{
                id: 0,
                name: '',
                posts: [{
                    id: 0,
                    user: 0,
                    text: 'Hallo wereld!',
                    votes: [{
                        user: 0,
                        isUpvote: true
                    }]
                }]
            }]
        })
        end();
    }
}