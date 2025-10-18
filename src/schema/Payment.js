const mongoose = require('mongoose');
const { Schema } = mongoose;

const paymentSchema = new Schema({
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'Order ID is required'],
    unique: true
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  amount: {
    type: mongoose.Types.Decimal128,
    required: [true, 'Payment amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  status: {
    type: Number,
    enum: {
      values: [0, 1, 2, 3], // 0: pending, 1: completed, 2: failed, 3: cancelled
      message: 'Invalid payment status'
    },
    default: 0
  },
  paymentMethod: {
    type: String,
    enum: ['mock', 'credit_card', 'debit_card', 'paypal', 'stripe', 'razorpay'],
    default: 'mock'
  },
  gatewayResponse: {
    type: Schema.Types.Mixed,
    default: {}
  },
  paidAt: {
    type: Date
  },
  expiresAt: {
    type: Date,
    default: function () {
      return new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
    }
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  collection: 'payments'
});

paymentSchema.index({ status: 1 });
paymentSchema.index({ expiresAt: 1 });
paymentSchema.index({ status: 1, expiresAt: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
