const mongoose = require('../db/mongoose-connection');

const Schema = new mongoose.Schema(
  {
    ipAddress: String,
    screen: String,
    url: String,
    script: String,
    scriptResult: String,
    pageContent: String,
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('ScriptError', Schema);
