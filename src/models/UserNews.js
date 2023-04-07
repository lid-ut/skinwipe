const mongoose = require('../db/mongoose-connection');

const create = require('./UserNews/create');

const Schema = new mongoose.Schema(
  {
    steamId: String,
    type: String,

    auction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auction',
    },

    trade: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trade',
    },
  },
  {
    timestamps: true,
  },
);

Schema.index({ steamId: 1 });
Schema.index({ createdAt: -1 });
Schema.index({ type: 1 });

Schema.statics.create = create;

module.exports = mongoose.model('UserNews', Schema);
