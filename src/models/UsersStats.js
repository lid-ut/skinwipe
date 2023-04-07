const mongoose = require('../db/mongoose-connection');

const Schema = new mongoose.Schema(
  {
    steamId: String,
    skinsWatched: [String],
  },
  {
    timestamps: true,
  },
);

Schema.index({ steamId: 1 });
Schema.index({ skinsWatched: 1 });

module.exports = mongoose.model('UsersStats', Schema, 'usersstats');
