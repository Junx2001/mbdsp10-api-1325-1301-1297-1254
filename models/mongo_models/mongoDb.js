// mongoose.js
const mongoose = require('mongoose');
const dbConfig = require('../../config/config');

mongoose.connect(dbConfig.mongo_string_connection);

module.exports = mongoose;
