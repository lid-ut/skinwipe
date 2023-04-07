const { Sequelize } = require('sequelize');
const config = require('../../../config');

global.Op = Sequelize.Op;
global.sequelize = new Sequelize(config.dbConfig.pg, {
  logging: false,
});

require('./models/Transactions');
// require('./models/UsersStats');
// require('./models/SkinsStickers');
// require('./models/Skins');
// require('./models/MarketSkins');
// require('./models/Trades');

module.exports = callback => {
  try {
    sequelize.authenticate().then(async () => {
      console.log('Connection has been established successfully.');
      await sequelize.sync({ alter: true });
      callback();
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};
