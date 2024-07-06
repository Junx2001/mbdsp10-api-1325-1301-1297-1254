const db = require('../models');

const roles = [
  { name: 'USER' },
  { name: 'SUPER-ADMIN' },
  { name: 'ADMIN' }
];

const init = async () => {
  await db.sequelize.sync({ force: true });
  for (const role of roles) {
    await db.Role.create(role);
  }
  console.log('Roles have been initialized');
  process.exit();
};

init();