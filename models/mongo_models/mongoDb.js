// mongoose.js
const mongoose = require('mongoose');
const dbConfig = require('../../config/config');

if(dbConfig.port){
    mongoose.connect('mongodb://'+dbConfig.mongo_db_host+':'+dbConfig.mongo_db_port+'/'+dbConfig.mongo_db_name);
}
else{
    mongoose.connect('mongodb+srv://'+dbConfig.mongo_db_host+'/'+dbConfig.mongo_db_name);
}


module.exports = mongoose;
