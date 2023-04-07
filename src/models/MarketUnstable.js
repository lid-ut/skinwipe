const mongoose = require('../db/mongoose-connection');

const Schema = new mongoose.Schema(
  {
    names: [String],
    collections: [String],
  },
  {
    timestamps: true,
  },
);

Schema.index({ names: 1 });
Schema.index({ collections: 1 });

const MarketUnstable = mongoose.model('MarketUnstable', Schema);

module.exports = MarketUnstable;
