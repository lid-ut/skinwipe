const mongoose = require('../db/mongoose-connection');

const Schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    steamIds: [String],
    removed: [String],
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    lastMessage: Object,
    counters: {
      type: Map,
      of: Number,
    },
  },
  {
    timestamps: true,
  },
);

Schema.index({ name: 1 });
Schema.index({ removed: 1 });
Schema.index({ steamIds: 1 });
Schema.index({ users: 1 });
Schema.index({ counters: 1 });

module.exports = mongoose.model('Room', Schema, 'rooms');
