const mongoose = require('../db/mongoose-connection');

const Schema = new mongoose.Schema(
  {
    sum: Number,
    sumVirtual: Number,
    usersBalance: Number,
    bots: [
      {
        name: String,
        steamId: String,
        sum: Number,
        sumVirtual: Number,
      },
    ],
  },
  {
    timestamps: true,
  },
);

Schema.index({ date: 1 });

module.exports = mongoose.model('TodayBotsInventoryStat', Schema);
