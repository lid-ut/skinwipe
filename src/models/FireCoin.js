const mongoose = require('../db/mongoose-connection');

const Schema = new mongoose.Schema(
  {
    steamId: String,
    reason: String,
    amount: Number,
    used: Number,
    expiration: Date,
  },
  {
    timestamps: true,
  },
);

Schema.index({ steamId: 1 });
Schema.index({ createdAt: 1 });

module.exports = mongoose.model('FireCoin', Schema);
