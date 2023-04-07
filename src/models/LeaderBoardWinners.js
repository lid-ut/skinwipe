const mongoose = require('../db/mongoose-connection');

const schema = new mongoose.Schema(
  {
    date: String,
    top: [
      {
        topPoints: Number,
        steamId: String,
        personaname: String,
        avatarfull: String,
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('leaderBoard', schema);
