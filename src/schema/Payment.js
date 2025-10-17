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
      sparse: true, // Allow null values but enforce uniqueness when present
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
      type: Schema.Types.Mixed, // For storing payment gateway responses
      default: {}
    },
    paidAt: {
      type: Date
    },
    expiresAt: {
      type: Date,
      default: function() {
        return new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
      }
    }
  }, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    collection: 'payments'
  });
  
  // Indexes
  paymentSchema.index({ orderId: 1 });
  paymentSchema.index({ transactionId: 1 });
  paymentSchema.index({ status: 1 });
  paymentSchema.index({ expiresAt: 1 });
  
  module.exports = mongoose.model('Payment', paymentSchema);
  