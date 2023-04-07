const mongoose = require('../db/mongoose-connection');

const Schema = new mongoose.Schema(
  {
    steamId: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

Schema.index({ steamId: 1 });
Schema.index({ entityId: 1 });

module.exports = mongoose.model('Like', Schema, 'likes');
