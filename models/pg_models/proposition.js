const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  const Proposition = sequelize.define('Proposition', {
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
  });

  Proposition.associate = models => {
    Proposition.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    Proposition.hasMany(models.PropositionProduct, { foreignKey: 'proposition_id'});
  };

  

  return Proposition;
};
