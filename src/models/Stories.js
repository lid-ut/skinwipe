const mongoose = require('../db/mongoose-connection');

const Schema = new mongoose.Schema(
  {
    active: Boolean,
    name: String,
    watched: Boolean,
    locale: [String],
    items: [
      {
        time: Number,
        title: String,
        img: String,
        imgHeight: Number,
        imgWidth: Number,
        text: String,
        button: Object,
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Stories', Schema, 'stories');
