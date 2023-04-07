const mongoose = require('../db/mongoose-connection');

const Schema = new mongoose.Schema(
  {
    steamId: String,
    ipAddress: String,
    attempt: Number,
    locale: String,
    device: String,
    token: String,
    os_type: String,
    active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

Schema.index({ locale: 1 });
Schema.index({ token: 1 });
Schema.index({ os_type: 1 });
Schema.index({ steamId: 1 });

module.exports = mongoose.model('FirebaseToken', Schema);
