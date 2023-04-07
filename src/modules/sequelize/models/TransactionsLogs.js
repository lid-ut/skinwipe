const { DataTypes } = require('sequelize');

global.LogsData = sequelize.define(
  'SteamPrices',
  {
    LogsData: {
      type: DataTypes.STRING,
    },

    LogsData: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: 'steamprices',
  },
);
