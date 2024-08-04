module.exports = (sequelize, DataTypes) => {
    const Role = sequelize.define('Role', {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      }
    });
  
    Role.associate = models => {
      Role.hasMany(models.User, {
        foreignKey: 'role_id',
        as: 'users'
      });
    };
  
    return Role;
  };
  