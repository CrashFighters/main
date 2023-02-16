const settings = require('../settings.json')
const { set, get } = require(`../${settings.generic.path.files.modules}database/functions/database.js`);

module.exports = {
    execute({ end }) {
        console.log(get())
        set({
            foo: 'bar'
        });
        console.log(get())

        end()
    }
}