// mongoose.js
const mongoose = require('mongoose');
const dbConfig = require('../../config/config');

mongoose.connect('mongodb://'+dbConfig.mongo_db_host+':'+dbConfig.mongo_db_port+'/'+dbConfig.mongo_db_name);

module.exports = mongoose;
