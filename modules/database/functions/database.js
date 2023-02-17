let admin;
let { serviceAccount, databaseURL };

let db;
let ref;

let data = null;
let err;

let hasInit = false;
function init() {
    admin = require('firebase-admin');
    { serviceAccount, databaseURL } = require('../../../credentials/firebase.json');

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL
    });

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