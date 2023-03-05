let admin;
let serviceAccount
let databaseURL;

let db;
let ref;
let app;

let dataResolve;
let data = new Promise(res => { dataResolve = res });
let dataResolved = false;
let err;

let hasInit = false;
async function init() {
    admin = require('firebase-admin');
    serviceAccount = require('../../../credentials/firebase.json').serviceAccount;
    databaseURL = require('../../../credentials/firebase.json').databaseURL;

    //todo: create separate getFirebase file
    app = await admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL
    }, 'database');

    db = app.database();
    ref = db.ref();

    ref.on('value', snapshot => {
        if (dataResolved)
            data = Promise.resolve(snapshot.val());
        else {
            dataResolve(snapshot.val());
            dataResolved = true;
        }
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

        let newData = await data;
        if (!newData) newData = {};

        return newData;
    }
}