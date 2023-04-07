const mongoose = require('../db/mongoose-connection');

const schema = new mongoose.Schema(
  {
    id: String,
    steamId: String,
    status: String,
    description: String,
    product: String,
    amount: Number,
    baseAmount: Number,
    currency: Number,
  },
  {
    timestamps: true,
  },
);

schema.index({ id: 1 });
schema.index({ steamId: 1 });

module.exports = mongoose.model('Best2Pay', schema);
