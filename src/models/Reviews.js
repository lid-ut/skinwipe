const mongoose = require('../db/mongoose-connection');

const Schema = new mongoose.Schema(
  {
    steamId: String,
    user: {
      steamId: String,
      personaname: String,
      avatar: String,
      subscriber: Boolean,
    },
    stars: Number,
    comment: String,
  },
  {
    timestamps: true,
  },
);

Schema.index({ steamId: 1 });
Schema.index({ 'user.steamId': 1 });

module.exports = mongoose.model('Reviews', Schema);
