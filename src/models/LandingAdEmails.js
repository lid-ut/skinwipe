const mongoose = require('../db/mongoose-connection');

const schema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: 'email is required',
      unique: 'this email already exist',
    },
    name: String,
    company: String,
    phone: String,
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('landing-ad-emails', schema);
