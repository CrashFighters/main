const admin = require('firebase-admin');
const { serviceAccount, databaseURL } = require('../../../credentials/firebase.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL
});

const db = admin.database();
const ref = db.ref();

let data = null;
let err;
ref.on('value', snapshot => {
    data = snapshot.val();
}, error => {
    err = error;
})

module.exports = {
    set(val) {
        ref.set(val)
    },
    get() {
        if (err)
            throw err;

        if (!data) return {};
        return data;
    }
}