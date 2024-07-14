const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  const Exchange = sequelize.define('Exchange', {
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    owner_proposition_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Propositions',
          key: 'id'
        }
      },
    taker_proposition_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Propositions',
          key: 'id'
        }
      },
    delivery_address: {
      type: DataTypes.STRING,
      allowNull: true
    },
   
  });
 
  Exchange.associate = models => {
    Exchange.belongsTo(models.Proposition, {
      foreignKey: 'owner_proposition_id',
      as: 'owner_proposition'
    });
    Exchange.belongsTo(models.Proposition, {
      foreignKey: 'taker_proposition_id',
      as: 'taker_proposition'
    });
  };

  return Exchange;
};
