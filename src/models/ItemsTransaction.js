const mongoose = require('../db/mongoose-connection');

const Schema = new mongoose.Schema(
  {
    status: String,
    type: String, // buy, send
    steamId: String,
    token: String,
    botItems: [String],
    userItems: [String],
  },
  {
    timestamps: true,
  },
);

Schema.index({ steamId: 1 });
Schema.index({ token: 1 });

module.exports = mongoose.model('itemstransactions', Schema);
