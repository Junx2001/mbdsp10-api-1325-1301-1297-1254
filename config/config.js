require('dotenv').config();

module.exports = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT,
  
  mongo_db_host: process.env.MONGO_DB_HOST,
  mongo_db_port: process.env.MONGO_DB_PORT,
  mongo_db_name: process.env.MONGO_DB_NAME,
  mongo_db_user: process.env.MONGO_DB_USER,
  mongo_db_password: process.env.MONGO_DB_PASSWORD,
};