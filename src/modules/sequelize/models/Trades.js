const { DataTypes } = require('sequelize');

global.Trades = sequelize.define(
  'Trades',
  {
    code: {
      type: DataTypes.STRING(40),
    },

    type: {
      type: DataTypes.STRING(40),
    },

    direction: {
      type: DataTypes.STRING(20),
    },

    virtual: {
      type: DataTypes.BOOLEAN,
    },

    send: {
      type: DataTypes.BOOLEAN,
    },

    buyer: {
      type: DataTypes.STRING(40),
    },

    seller: {
      type: DataTypes.REAL,
    },

    sellerDateCreate: {
      type: DataTypes.BIGINT,
    },

    tradeUrl: {
      type: DataTypes.TEXT,
    },

    status: {
      type: DataTypes.STRING(20),
    },

    attempt: {
      type: DataTypes.INTEGER,
    },

    closeReason: {
      type: DataTypes.STRING(20),
    },

    steamTradeId: {
      type: DataTypes.STRING(30),
    },
  },
  {
    tableName: 'trades',
  },
);

Trades.hasMany(MarketSkins);
