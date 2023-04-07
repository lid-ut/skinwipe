const mongoose = require('../db/mongoose-connection');

const Schema = new mongoose.Schema(
  {
    type: String,
    steamId: String,
    name: String,
    phone: String,
    email: String,
    comment: String,
  },
  {
    timestamps: true,
  },
);

Schema.index({ steamId: 1 });

module.exports = mongoose.model('Feedback', Schema);
