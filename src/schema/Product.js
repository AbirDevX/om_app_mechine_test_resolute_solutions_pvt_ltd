const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxLength: [255, 'Product name cannot exceed 255 characters']
    },
    price: {
        type: mongoose.Types.Decimal128,
        required: [true, 'Product price is required'],
        min: [0.01, 'Price must be greater than 0']
    },
    totalStock: {
        type: Number,
        required: [true, 'Total stock is required'],
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    reservedStock: {
        type: Number,
        required: [true, 'Reserved stock is required'],
        min: [0, 'Reserved stock cannot be negative'],
        default: 0
    },
    description: {
        type: String,
        trim: true,
        maxLength: [1000, 'Description cannot exceed 1000 characters']
    },
    status: {
        type: Number,
        enum: [0, 1],
        default: 1,
        validate: {
            validator: function (v) {
                return [0, 1].includes(v);
            },
            message: 'Status must be 0 (inactive) or 1 (active)'
        }
    },
    isDeleted: {
        type: Number,
        enum: [0, 1],
        default: 0
    }
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    collection: 'products'
});

// Virtual field for available stock
productSchema.virtual('availableStock').get(function () {
    return this.totalStock - this.reservedStock;
});

// Ensure virtuals are included in JSON output
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Index for performance
productSchema.index({ name: 1 });
productSchema.index({ status: 1, isDeleted: 1 });

module.exports = mongoose.model('Product', productSchema);
