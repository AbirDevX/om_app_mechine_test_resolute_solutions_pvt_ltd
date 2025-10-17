const orderSchema = new Schema({
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    totalAmount: {
      type: mongoose.Types.Decimal128,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative']
    },
    orderStatus: {
      type: String,
      enum: {
        values: ['PENDING_PAYMENT', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
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
  
  // Indexes
  orderSchema.index({ userId: 1 });
  orderSchema.index({ orderStatus: 1 });
  orderSchema.index({ createdAt: -1 });
  
  module.exports = mongoose.model('Order', orderSchema);
  