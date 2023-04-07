const mongoose = require('../db/mongoose-connection');

require('./FirebaseToken');

const Schema = new mongoose.Schema(
  {
    steamId: String,
    lastActiveDate: { type: Date, default: Date.now },
    notifications: Object,
  },
  {
    timestamps: true,
  },
);

Schema.virtual('firebaseTokens', {
  ref: 'TempFirebaseToken',
  localField: '_id',
  foreignField: 'userId',
  justOne: false,
});

module.exports = mongoose.model('FakeUser', Schema);
