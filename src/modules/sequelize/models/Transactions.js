const { DataTypes } = require('sequelize');

global.Transactions = sequelize.define(
  'Transactions',
  {
    steamId: {
      type: DataTypes.STRING(40),
    },

    type: {
      type: DataTypes.STRING(40),
    },

    status: {
      type: DataTypes.STRING(20),
    },

    direction: {
      type: DataTypes.STRING,
    },

    amount: {
      type: DataTypes.REAL,
    },

    balance: {
      type: DataTypes.REAL,
    },

    token: {
      type: DataTypes.TEXT,
    },

    reason: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: 'transactions',
  },
);
