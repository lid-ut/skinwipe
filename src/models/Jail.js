const mongoose = require('../db/mongoose-connection');

const Schema = new mongoose.Schema(
  {
    steamId: String,
    type: String,
    expiration: Date,
    reason: String,
  },
  {
    timestamps: true,
  },
);

Schema.index({ steamId: 1 });

Schema.virtual('user', {
  ref: 'User',
  localField: 'steamId',
  foreignField: 'steamId',
  justOne: true,
});

module.exports = mongoose.model('Jail', Schema);
