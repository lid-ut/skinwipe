const { DataTypes } = require('sequelize');

global.MarketSkins = sequelize.define(
  'MarketSkins',
  {
    steamId: {
      type: DataTypes.STRING(20),
    },

    price: {
      type: DataTypes.INTEGER,
    },

    type: {
      type: DataTypes.STRING(20),
    },

    withdrawn: {
      type: DataTypes.BOOLEAN,
    },

    visible: {
      type: DataTypes.BOOLEAN,
    },

    reserver: {
      type: DataTypes.STRING(20),
    },

    virtual: {
      type: DataTypes.BOOLEAN,
    },
  },
  {
    tableName: 'marketskins',
  },
);

MarketSkins.hasOne(Skins);
