const { DataTypes } = require('sequelize');

global.SkinsStickers = sequelize.define(
  'SkinsStickers',
  {
    slot: {
      type: DataTypes.INTEGER,
    },
    wear: {
      type: DataTypes.REAL,
    },

    img: {
      type: DataTypes.TEXT,
    },

    name: {
      type: DataTypes.STRING(20),
    },
  },
  {
    tableName: 'skinsstickers',
  },
);
