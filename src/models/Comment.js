const mongoose = require('../db/mongoose-connection');

const Schema = new mongoose.Schema(
  {
    steamId: { type: String, required: true },
    entityPreview: Object,
    entityType: { type: String, required: true },
    entityId: { type: String, required: true },
    comment: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

Schema.virtual('user', {
  ref: 'User',
  localField: 'steamId',
  foreignField: 'steamId',
  justOne: true, // for many-to-1 relationships
});

Schema.index({ steamId: 1 });
Schema.index({ entityId: 1 });
Schema.index({ entityType: 1 });
Schema.index({ entityId: 1, entityType: 1 });

module.exports = mongoose.model('Comment', Schema, 'comments');
