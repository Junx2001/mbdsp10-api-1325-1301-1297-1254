const { Sequelize, DataTypes } = require('sequelize');
const dbConfig = require('../config/config');
const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  dialect: dbConfig.dialect
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.User = require('./user')(sequelize, DataTypes);
db.Role = require('./role')(sequelize, DataTypes);
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.Category = require('./category')(sequelize, DataTypes);
db.Product = require('./product')(sequelize, DataTypes);
db.ProductCategory = require('./productCategory')(sequelize, DataTypes);
db.Product.belongsToMany(db.Category, { through: db.ProductCategory, foreignKey: 'product_id' });
db.Category.belongsToMany(db.Product, { through: db.ProductCategory, foreignKey: 'category_id' });

module.exports = db;
