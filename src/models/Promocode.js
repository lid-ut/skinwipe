const mongoose = require('../db/mongoose-connection');

const Schema = new mongoose.Schema(
  {
    vk_id: String,
    promo: String,
    code_type: String,
    amount: Number,
    validTo: Date,
  },
  {
    timestamps: true,
  },
);

Schema.index({ promo: 1 });

module.exports = mongoose.model('Promocode', Schema, 'promocods');
