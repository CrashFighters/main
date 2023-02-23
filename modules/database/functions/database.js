let admin;
let serviceAccount
let databaseURL;

let db;
let ref;

let data = null;
let err;

let hasInit = false;
function init() {
    console.log('Initializing database');

    admin = require('firebase-admin');
    serviceAccount = require('../../../credentials/firebase.json').serviceAccount;
    databaseURL = require('../../../credentials/firebase.json').databaseURL;

    admin.initializeApp({
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
    set(val) {
        if (!hasInit)
            init();

        ref.set(val)
    },
    get() {
        if (!hasInit)
            init()

        if (err)
            throw err;

        if (!data) return {};
        return data;
    }
}