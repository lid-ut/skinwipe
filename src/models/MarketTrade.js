const mongoose = require('../db/mongoose-connection');

const schema = new mongoose.Schema(
  {
    code: String,
    type: String,
    direction: String,
    virtual: Boolean,
    send: Boolean,
    buyer: String,
    found: Boolean,
    seller: String,
    sellerDateCreate: Number,
    tradeUrl: String,
    status: String,
    csgotmStatus: String,
    csgotmKey: String,
    attempt: Number,
    closeReason: String,
    steamTradeId: String,
    isEscrow: Boolean,
    items: [
      {
        price: {
          steam: {
            percent: Number,
            base: Number,
            baseCSGOTM: Number,
            safe: Number,
            mean: Number,
          },
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
      },
    ],
    itemsPartner: [
      {
        price: {
          steam: {
            percent: Number,
            base: Number,
            baseCSGOTM: Number,
            safe: Number,
            mean: Number,
          },
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
      },
    ],
  },
  {
    timestamps: true,
  },
);

schema.index({ status: 1 });
schema.index({ csgotmStatus: 1 });
schema.index({ 'itemsPartner.name': 1 });
schema.index({ 'items.name': 1 });
schema.index({ direction: 1 });
schema.index({ steamTradeId: 1 });
schema.index({ send: 1 });
schema.index({ virtual: 1 });
schema.index({ code: 1 });
schema.index({ type: 1 });
schema.index({ buyer: 1 });
schema.index({ seller: 1 });

const MarketTrade = mongoose.model('MarketTrade', schema);

module.exports = MarketTrade;
