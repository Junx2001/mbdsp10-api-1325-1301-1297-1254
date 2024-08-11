module.exports = (sequelize, DataTypes) => {
    const ProductCategory = sequelize.define('ProductCategory', {});
    ProductCategory.associate = models => {
      ProductCategory.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product'
      });
      ProductCategory.belongsTo(models.Category, {
        foreignKey: 'category_id',
        as: 'category'
      });
    };
    return ProductCategory;
  };
