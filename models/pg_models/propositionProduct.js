module.exports = (sequelize, DataTypes) => {
    const PropositionProduct = sequelize.define('PropositionProduct', {});
    PropositionProduct.associate = models => {
      PropositionProduct.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product'
      });
      PropositionProduct.belongsTo(models.Proposition, {
        foreignKey: 'proposition_id',
        as: 'proposition'
      });
    };
    return PropositionProduct;
  };
