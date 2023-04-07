// Mongodb
const mongoose = require('../db/mongoose-connection');

const Schema = new mongoose.Schema(
  {
    steamId: String,
    quests: [
      {
        quest: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Quest',
        },
        rewarded: Boolean,
      },
    ],
    rewardCoolDown: Date,
  },
  {
    timestamps: true,
  },
);

Schema.index({ steamId: 1 });

module.exports = mongoose.model('QuestEntry', Schema);
