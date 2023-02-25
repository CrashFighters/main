let admin;
let serviceAccount
let databaseURL;

let db;
let ref;

let data = null;
let err;

let hasInit = false;
async function init() {
    admin = require('firebase-admin');
    serviceAccount = require('../../../credentials/firebase.json').serviceAccount;
    databaseURL = require('../../../credentials/firebase.json').databaseURL;

    await admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL
    }, 'database');

    db = admin.database();
    ref = db.ref();

    ref.on('value', snapshot => {
        data = snapshot.val();
    }, error => {
        err = error;
    });

    hasInit = true;
};

module.exports = {
    async set(val) {
        if (!hasInit)
            await init();

        ref.set(val)
    },
    async get() {
        if (!hasInit)
            await init()

        if (err)
            throw err;

        if (!data) return {};
        return data;
    }
}
