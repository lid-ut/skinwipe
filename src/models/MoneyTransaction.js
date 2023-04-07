const mongoose = require('../db/mongoose-connection');

const Schema = new mongoose.Schema(
  {
    status: String,
    steamId: String,
    token: String,
    info: Object,
    amount: Number,
    notif: Boolean,
  },
  {
    timestamps: true,
  },
);

Schema.index({ steamId: 1 });
Schema.index({ token: 1 });

module.exports = mongoose.model('moneytransactions', Schema);
