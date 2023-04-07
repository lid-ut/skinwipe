const mongoose = require('../db/mongoose-connection');

const Schema = new mongoose.Schema(
  {
    steamId: String,
    platforms: Array,
    payload: Object,
  },
  {
    timestamps: true,
  },
);

Schema.index({ steamId: 1 });

module.exports = mongoose.model('Push', Schema);
