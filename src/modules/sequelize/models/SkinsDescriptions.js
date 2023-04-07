const { DataTypes } = require('sequelize');

global.Skins = sequelize.define(
  'Skins',
  {
    appid: {
      type: DataTypes.INTEGER,
    },

    assetid: {
      type: DataTypes.STRING(30),
    },

    classid: {
      type: DataTypes.STRING(30),
    },

    contextid: {
      type: DataTypes.STRING(30),
    },

    instanceid: {
      type: DataTypes.STRING(30),
    },

    marketable: {
      type: DataTypes.BOOLEAN,
    },

    float: {
      type: DataTypes.STRING(30),
    },

    paintWear: {
      type: DataTypes.REAL,
    },

    tradable: {
      type: DataTypes.BOOLEAN,
    },

    tradeBan: {
      type: DataTypes.BIGINT,
    },

    market_tradable_restriction: {
      type: DataTypes.INTEGER,
    },

    name: {
      type: DataTypes.STRING(50),
    },

    action: {
      type: DataTypes.STRING(50),
    },

    image_small: {
      type: DataTypes.STRING(250),
    },

    image_large: {
      type: DataTypes.STRING(250),
    },

    Type: {
      type: DataTypes.STRING(250),
    },

    ItemSet: {
      type: DataTypes.STRING(250),
    },

    Weapon: {
      type: DataTypes.STRING(250),
    },

    Quality: {
      type: DataTypes.STRING(250),
    },

    Rarity: {
      type: DataTypes.STRING(250),
    },

    RarityColor: {
      type: DataTypes.STRING(250),
    },

    ExteriorMin: {
      type: DataTypes.STRING(250),
    },
  },
  {
    tableName: 'trades',
  },
);

Skins.hasMany(SkinsStickers);
