const mongoose = require('../db/mongoose-connection');

const Schema = new mongoose.Schema(
  {
    steamId: String,
    status: String,
    token: String,
    lastCheck: Number,
    JSONdata: String,
    signature: String,
    data: Object,
    success: Boolean,
    iapErrors: [Object],
  },
  {
    timestamps: true,
  },
);

Schema.index({ steamId: 1 });
Schema.index({ token: 1 });

module.exports = mongoose.model('purchase', Schema);
