const mongoose = require('../db/mongoose-connection');

const Schema = mongoose.Schema;
const Statuses = Object.freeze({
  new: 0,
  inProgress: 1,
  done: 2,
  failed: 3,
});

const StickersOnItemQueue = new Schema(
  {
    steamId: String,
    name: String,
    stickers: Array,
    status: {
      type: Number,
      default: 0,
      enum: Object.values(Statuses),
    },
  },
  {
    timestamps: true,
  },
);
Object.assign(StickersOnItemQueue.statics, {
  Statuses,
});

StickersOnItemQueue.index({
  status: 1,
  name: 1,
  stickers: 1,
  steamId: 1,
});

StickersOnItemQueue.index({ status: 1 });

module.exports = mongoose.model('StickersOnItemQueue', StickersOnItemQueue);
