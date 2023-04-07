const mongoose = require('../db/mongoose-connection');

const Schema = mongoose.Schema;

const ActionPrice = new Schema(
  {
    name: String,
    price: Number,
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('ActionPrice', ActionPrice);
