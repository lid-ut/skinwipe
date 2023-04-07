const mongoose = require('../db/mongoose-connection');

const Schema = new mongoose.Schema(
  {
    appid: String,
    steamid: String,
    buyer: String,
    reserver: String,
    virtual: Boolean,
    visible: Boolean,
    withdrawn: { type: Boolean, default: false },
    pushSent: Boolean,
    price: {
      steam: {
        safe: Number,
        mean: Number,
        base: Number,
        converted: Number,
      },
    },
    stickers: [Object],
    stickerPics: [String],
    stickerNames: [String],
    runeNames: [String],
    float: String,
    paintWear: Number,
    paintseed: Number,
    amount: String,
    action: String,
    assetid: String,
    classid: String,
    contextid: String,
    instanceid: String,
    marketable: Boolean,
    tradable: Boolean,
    tradeBan: Date,
    market_tradable_restriction: Number,
    name: String,
    nameTag: String,
    fullName: String,
    image_small: String,
    image_large: String,
    Type: String,
    Weapon: String,
    Exterior: String,
    ExteriorMin: String,
    Hero: String,
    Slot: String,
    WeaponName: String,
    TypeName: String,
    ItemSet: String,
    ItemSetName: String,
    Quality: String,
    QualityName: String,
    Rarity: String,
    RarityName: String,
    RarityColor: String,
  },
  {
    timestamps: true,
  },
);

Schema.index({ reserver: 1 });
Schema.index({ buyer: 1 });
Schema.index({ steamid: 1 });
Schema.index({ Type: 1 });
Schema.index({ Weapon: 1 });
Schema.index({ Exterior: 1 });
Schema.index({ Quality: 1 });
Schema.index({ Rarity: 1 });
Schema.index({ tradable: 1 });
Schema.index({ pushSent: 1 });
Schema.index({ steamid: 1 });
Schema.index({ float: 1 });
Schema.index({ steamid: 1, appid: 1, assetid: 1 }, { unique: true });
Schema.index({ name: 1 });

const BotSteamItems = mongoose.model('BotSteamItem', Schema);

module.exports = BotSteamItems;
