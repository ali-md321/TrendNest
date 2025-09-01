// server/firebase.js
const admin = require("firebase-admin");
const serviceAccount = require("../assets/Firebase_Auth_ServiceAcc.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
