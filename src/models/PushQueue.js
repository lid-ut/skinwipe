const mongoose = require('../db/mongoose-connection');

const Schema = mongoose.Schema;
const PushSchema = new Schema(
  {
    steamId: String,
    platforms: Array,
    pushData: Object,
    sendDate: Date,
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('PushQueue', PushSchema);
