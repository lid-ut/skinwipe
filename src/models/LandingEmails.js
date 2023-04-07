const mongoose = require('../db/mongoose-connection');

const schema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: 'email is required',
      unique: 'this email already exist',
    },
    landing_id: String,
    section: String,
    campaign: String,
    source: String,
    community: String,
    post: String,
    create_date: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('landing-emails', schema);
