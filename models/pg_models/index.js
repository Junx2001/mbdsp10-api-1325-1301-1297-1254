const { Sequelize, DataTypes } = require('sequelize');
const dbConfig = require('../../config/config');

const sequelizeConfig = {
  host: dbConfig.host,
  dialect: dbConfig.dialect, 
  port: dbConfig.port,
};
if (dbConfig.ssl_enable === 'true') {
  sequelizeConfig.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  };
}
const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, sequelizeConfig);


const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.User = require('./user')(sequelize, DataTypes);
db.Role = require('./role')(sequelize, DataTypes);

db.Category = require('./category')(sequelize, DataTypes);
db.Product = require('./product')(sequelize, DataTypes);
db.ProductCategory = require('./productCategory')(sequelize, DataTypes);
db.Product.belongsToMany(db.Category, { through: db.ProductCategory, foreignKey: 'product_id' });
db.Category.belongsToMany(db.Product, { through: db.ProductCategory, foreignKey: 'category_id' });

db.Proposition = require('./proposition')(sequelize, DataTypes);
db.Exchange = require('./exchange')(sequelize, DataTypes);
db.PropositionProduct = require('./propositionProduct')(sequelize, DataTypes);
db.Product.belongsToMany(db.Proposition, { through: db.PropositionProduct, foreignKey: 'product_id' });
db.Proposition.belongsToMany(db.Product, { through: db.PropositionProduct, foreignKey: 'proposition_id' });


Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});
module.exports = db;
