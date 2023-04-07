const mongoose = require('../db/mongoose-connection');

const schema = new mongoose.Schema(
  {
    id: String,
    status: String,
    paid: Boolean,
    created_at: Date,
    description: String,
    refundable: Boolean,
    test: Boolean,
    amount: Object,
    confirmation: Object,
    metadata: Object,
    recipient: Object,
    payment_method: Object,
    cancellation_details: Object,

    receipt: Object,
    steamId: String,
    product: String,
    productCount: Number,
  },
  {
    timestamps: true,
  },
);

schema.index({ id: 1 });
schema.index({ steamId: 1 });

module.exports = mongoose.model('KassaIOSToken', schema);
