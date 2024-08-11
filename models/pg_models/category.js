module.exports = (sequelize, DataTypes) => {
    const Category = sequelize.define('Category', {
      category_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      }
    });
  
    return Category;
  };
