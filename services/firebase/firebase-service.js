const fb_firebase = require("firebase/app");
const fb_storage = require("firebase/storage");
const dbConfig = require('../../config/config');

const app = fb_firebase.initializeApp(dbConfig.firebaseConfig);
const storage = fb_storage.getStorage(app);

module.exports = { app, storage, fb_storage };