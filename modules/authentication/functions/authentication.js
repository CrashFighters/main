const firebase = require('firebase-admin');

const { serviceAccount, databaseURL } = require('../../../credentials/firebase.json');

firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL
});

module.exports = firebase;