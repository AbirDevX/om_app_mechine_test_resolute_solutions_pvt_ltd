const mongoose = require('mongoose');
const { Schema } = require("mongoose");


const cartItemSchema = new Schema({
  cartId: {
    type: Schema.Types.ObjectId,
    ref: 'Cart',
    required: [true, 'Cart ID is required']
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
    max: [1000, 'Quantity cannot exceed 1000'],
    default: 1
  },
  unitPrice: {
    type: mongoose.Types.Decimal128,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative']
  },
  totalPrice: {
    type: mongoose.Types.Decimal128,
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative']
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  collection: 'cartItems'
});

// Pre-save middleware to calculate total price
cartItemSchema.pre('save', function (next) {
  if (this.isModified('quantity') || this.isModified('unitPrice')) {
    this.totalPrice = mongoose.Types.Decimal128.fromString(
      (this.quantity * parseFloat(this.unitPrice.toString())).toFixed(2)
    );
  }
  next();
});

// Compound index for unique cart-product combination
// cartItemSchema.index({ cartId: 1, productId: 1 }, { unique: true });
cartItemSchema.index({ cartId: 1 });
cartItemSchema.index({ productId: 1 });

module.exports = mongoose.model('CartItem', cartItemSchema);
