const mongoose = require('../db/mongoose-connection');

const Schema = new mongoose.Schema(
  {
    type: String, // 'message' or 'trade'
    message: String,
    room: String,
    steamId: String,
    userName: String,
    avatar: String,
    supportResolved: { type: Boolean, default: false },
    trade: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MessageTrade',
    },
  },
  {
    timestamps: true,
  },
);

Schema.virtual('user', {
  ref: 'User',
  localField: 'steamId',
  foreignField: 'steamId',
  justOne: true,
});

Schema.index({ supportResolved: 1 });
Schema.index({ steamId: 1 });
Schema.index({ room: 1 });
Schema.index({ createdAt: 1 });
Schema.index({ createdAt: -1 });

module.exports = mongoose.model('Message', Schema, 'messages');
