const { DataTypes } = require('sequelize');

global.SteamPrices = sequelize.define(
  'SteamPrices',
  {
    name: {
      type: DataTypes.STRING,
    },

    appid: {
      type: DataTypes.STRING,
    },

    price_steam: {
      type: DataTypes.INTEGER,
    },

    price_in: {
      type: DataTypes.INTEGER,
    },

    price_out: {
      type: DataTypes.INTEGER,
    },
  },
  {
    tableName: 'steamprices',
  },
);
