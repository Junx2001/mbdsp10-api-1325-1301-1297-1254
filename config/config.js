require('dotenv').config();

module.exports = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: process.env.DB_DIALECT,
  ssl_enable: process.env.DB_SSL_ENABLE,
  
  mongo_db_host: process.env.MONGO_DB_HOST,
  mongo_db_port: process.env.MONGO_DB_PORT,
  mongo_db_name: process.env.MONGO_DB_NAME,
  mongo_db_user: process.env.MONGO_DB_USER,
  mongo_db_password: process.env.MONGO_DB_PASSWORD,

  firebaseConfig: {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
  }
};