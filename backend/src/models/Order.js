const { Schema, model } = require('mongoose');

const OrderItemSchema = new Schema(
  {
    productId: { type: String, trim: true },
    name:      { type: String, required: true, trim: true },
    price:     { type: Number, required: true, min: 0 },
    qty:       { type: Number, required: true, min: 1 },
    subtotal:  { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    user:   { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items:  { type: [OrderItemSchema], required: true, validate: v => Array.isArray(v) && v.length > 0 },
    totals: {
      items:  { type: Number, required: true, min: 1 },
      amount: { type: Number, required: true, min: 0 }
    },
    status:  { type: String, enum: ['created','paid','shipped','delivered','cancelled'], default: 'created' },
    payment: {
      method: { type: String, trim: true, default: 'manual' },
      ref:    { type: String, trim: true }
    },
    shipping: {
      name:    { type: String, trim: true },
      address: { type: String, trim: true },
      city:    { type: String, trim: true },
      zip:     { type: String, trim: true }
    }
  },
  { timestamps: true }
);

module.exports = model('Order', OrderSchema);
