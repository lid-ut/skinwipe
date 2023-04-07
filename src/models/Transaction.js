const mongoose = require('../db/mongoose-connection');

const Schema = new mongoose.Schema(
  {
    user_steam_id: String,
    info: String,
    usedEntity: String,
    token: String,
    amount: Number,
    notification: Boolean,
  },
  {
    timestamps: true,
  },
);

Schema.index({ user_steam_id: 1 });
Schema.index({ token: 1 });

module.exports = mongoose.model('transactions', Schema);
