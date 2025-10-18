const mongoose = require('mongoose');
const { Schema } = require("mongoose");

const cartSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true // One active cart per user
  },
  status: {
    type: Number,
    enum: [0, 1], // 0: inactive, 1: active
    default: 1
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  collection: 'carts'
});

// Indexes
cartSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Cart', cartSchema);
