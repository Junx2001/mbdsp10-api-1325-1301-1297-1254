module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define('Product', {
      product_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true
      },
      product_image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_exchangeable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      first_owner_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      actual_owner_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
    }, {
      paranoid: true // Enable soft delete
    });

    Product.associate = models => {
      Product.belongsTo(models.User, {
        foreignKey: 'first_owner_id',
        as: 'first_owner'
      });
      Product.belongsTo(models.User, {
        foreignKey: 'actual_owner_id',
        as: 'actual_owner'
      });
      Product.belongsToMany(models.Category, {
        through: 'ProductCategories',
        foreignKey: 'product_id',
        as: 'categories'
      });
    };
  
    return Product;
  };
