const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderItemSchema = new Schema({
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'Order ID is required']
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    max: [1000, 'Quantity cannot exceed 1000']
  },
  priceAtPurchase: {
    type: mongoose.Types.Decimal128,
    required: [true, 'Purchase price is required'],
    min: [0, 'Price cannot be negative']
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  collection: 'orderItems'
});

// Virtual for total price
orderItemSchema.virtual('totalPrice').get(function () {
  return this.quantity * parseFloat(this.priceAtPurchase.toString());
});

orderItemSchema.index({ orderId: 1, productId: 1 }, { unique: true });
orderItemSchema.index({ orderId: 1 });
orderItemSchema.index({ productId: 1 });

orderItemSchema.set('toJSON', { virtuals: true });
orderItemSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('OrderItem', orderItemSchema);
