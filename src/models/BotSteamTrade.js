const mongoose = require('../db/mongoose-connection');

const schema = new mongoose.Schema(
  {
    userSteamId: String,
    sendAfter: {type: mongoose.Schema.Types.ObjectId, ref: 'Trade'},
    sendOnly: Boolean,
    subscriber: Boolean,
    userTradeUrl: String,
    bot: {type: mongoose.Schema.Types.ObjectId, ref: 'Bots'},
    status: String, // new, sent, close, done
    type: String, // send, accept
    attempt: Number,
    steamTradeId: Number,
    steamTradeStatus: String,
    errorReason: String,
    difference: Number,
    userItems: [
      {
        price: {
          steam: {
            mean: Number,
            safe: Number
          }
        },
        stickers: [Object],
        stickerNames: [String],
        stickerPics: [String],
        appid: Number,
        amount: String,
        assetid: String,
        classid: String,
        contextid: String,
        instanceid: String,
        marketable: Boolean,
        float: String,
        paintWear: Number,
        tradable: Boolean,
        market_tradable_restriction: Number,
        name: String,
        image_small: String,
        image_large: String,
        Type: String,
        TypeName: String,
        ItemSet: String,
        ItemSetName: String,
        Weapon: String,
        Quality: String,
        QualityName: String,
        Rarity: String,
        RarityName: String,
        RarityColor: String,
        ExteriorMin: String,
      }
    ],
    botItems: [
      {
        price: {
          steam: {
            mean: Number,
            safe: Number
          }
        },
        stickers: [Object],
        stickerNames: [String],
        stickerPics: [String],
        appid: Number,
        amount: String,
        assetid: String,
        classid: String,
        contextid: String,
        instanceid: String,
        marketable: Boolean,
        float: String,
        paintWear: Number,
        tradable: Boolean,
        market_tradable_restriction: Number,
        name: String,
        image_small: String,
        image_large: String,
        Type: String,
        TypeName: String,
        ItemSet: String,
        ItemSetName: String,
        Weapon: String,
        Quality: String,
        QualityName: String,
        Rarity: String,
        RarityName: String,
        RarityColor: String,
        ExteriorMin: String,
      }
    ],
  },
  {
    timestamps: true,
  },
);

schema.index({ createdAt: 1 });
schema.index({ userSteamId: 1 });
schema.index({ bot: 1 });
schema.index({ sendAfter: 1 });
schema.index({ sendOnly: 1 });
schema.index({ steamTradeStatus: 1 });
schema.index({ steamTradeId: 1 });

schema.index({ 'userItems.appid': 1 });
schema.index({ 'userItems.assetid': 1 });
schema.index({ 'userItems.name': 1 });
schema.index({ 'userItems.price.steam.mean': 1 });
schema.index({ 'userItems.price.steam.safe': 1 });

schema.index({ 'botItems.appid': 1 });
schema.index({ 'botItems.assetid': 1 });
schema.index({ 'botItems.name': 1 });
schema.index({ 'botItems.price.steam.mean': 1 });
schema.index({ 'botItems.price.steam.safe': 1 });

const BotSteamPrice = mongoose.model('BotSteamTrade', schema);

module.exports = BotSteamPrice;
