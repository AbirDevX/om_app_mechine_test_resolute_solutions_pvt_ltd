const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
    // Remove index: true from here since we use schema.index() below
  },
  totalAmount: {
    type: mongoose.Types.Decimal128,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  orderStatus: {
    type: String,
    enum: {
      values: ['PENDING_PAYMENT', 'PAID', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
      message: 'Invalid order status'
    },
    default: 'PENDING_PAYMENT'
  },
  notes: {
    type: String,
    trim: true,
    maxLength: [500, 'Notes cannot exceed 500 characters']
  },
  isDeleted: {
    type: Number,
    enum: [0, 1],
    default: 0
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  collection: 'orders'
});

orderSchema.index({ userId: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ userId: 1, orderStatus: 1 });

module.exports = mongoose.model('Order', orderSchema);
