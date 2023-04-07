// Mongodb
const mongoose = require('../db/mongoose-connection');

const Schema = new mongoose.Schema(
  {
    name: String,
    type: String,
    start: Date,
    expiration: Date,
    reward: {
      entity: String,
      amount: Number,
    },
  },
  {
    timestamps: true,
  },
);

Schema.index({ start: 1 });
Schema.index({ expiration: 1 });

module.exports = mongoose.model('Quest', Schema);
