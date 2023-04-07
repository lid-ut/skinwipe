// Mongodb
const mongoose = require('../db/mongoose-connection');

const Schema = new mongoose.Schema(
  {
    appid: Number,
    usersCount: Number,
    classid: String,
    unstable: Boolean,
    unstable_reason: String,
    prices: {
      safe: Number,
      mean: Number,
    },
    image: String,
    renderedImagePath: String,
    renderedImageURI: String,
    border_color: String,
    market_hash_name: String,
    market_name: String,
    nameID: String,

    hero: String,
    rarity: String,
    quality: String,

    Quality: String, // CSGO, Dota2
    QualityName: String, // CSGO, Dota2
    QualityColor: String, // CSGO, Dota2
    Rarity: String, // CSGO, Dota2
    RarityName: String, // CSGO, Dota2
    RarityColor: String, // CSGO, Dota2
    Type: String, // CSGO, Dota2
    Slot: String, // Dota2
    Hero: String, // Dota2
    Weapon: String, // CSGO
    ItemSet: String, // CSGO
    ItemSetName: String, // CSGO
    Exterior: String, // CSGO
    ExteriorMin: String, // CSGO

    updateFileldsDate: Date,
    updatePricesDate: Date,
    steamFoxCallDate: Date,
  },
  {
    timestamps: true,
  },
);

Schema.index({ classid: 1 });
Schema.index({ usersCount: -1 });
Schema.index({ steamFoxCallDate: 1 });
Schema.index({ updatePricesDate: 1 });
Schema.index({ updateFileldsDate: 1 });
Schema.index({ market_name: 1 });
Schema.index({ market_hash_name: 1 });
Schema.index({ 'prices.mean': -1 });

const SteamMarketItem = mongoose.model('SteamMarketItem', Schema);

module.exports = SteamMarketItem;
