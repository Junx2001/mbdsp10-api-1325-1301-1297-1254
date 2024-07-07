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
    });
  
    return Product;
  };
