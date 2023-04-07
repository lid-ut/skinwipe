const mongoose = require('../db/mongoose-connection');

const schema = new mongoose.Schema(
  {
    tradeCustomId: String,
    bot: String,
    itemsIn: [
      {
        appid: String,
        assetid: String,
        contextid: String,
        amount: String,
        name: String,
        price: Number,
      },
    ],
    itemsOut: [
      {
        appid: String,
        assetid: String,
        contextid: String,
        amount: String,
        name: String,
        price: Number,
      },
    ],
  },
  {
    timestamps: true,
  },
);

const BotSteamPrice = mongoose.model('BotSteamTradeHistory', schema);

module.exports = BotSteamPrice;
