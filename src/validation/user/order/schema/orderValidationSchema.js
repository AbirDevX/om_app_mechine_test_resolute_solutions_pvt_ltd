const Joi = require('joi');

// Checkout validation schema
const checkoutSchema = Joi.object({
    notes: Joi.string()
        .trim()
        .max(500)
        .allow('')
        .optional()
        .messages({
            'string.max': 'Notes cannot exceed 500 characters.*'
        })
}).options({
    stripUnknown: true,
    convert: true,
    abortEarly: false
});

// Payment processing validation schema
const processPaymentSchema = Joi.object({
    paymentMethod: Joi.string()
        .valid('mock', 'credit_card', 'debit_card', 'paypal', 'stripe', 'razorpay')
        .default('mock')
        .messages({
            'any.only': 'Invalid payment method.*'
        })
}).options({
    stripUnknown: true,
    convert: true,
    abortEarly: false
});

// Order list query validation
const orderListQuerySchema = Joi.object({
    page: Joi.number()
        .integer()
        .min(1)
        .default(1)
        .messages({
            'number.integer': 'Page must be an integer.*',
            'number.min': 'Page must be at least 1.*'
        }),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10)
        .messages({
            'number.integer': 'Limit must be an integer.*',
            'number.min': 'Limit must be at least 1.*',
            'number.max': 'Limit cannot exceed 100.*'
        }),

    status: Joi.string()
        .valid('all', 'PENDING_PAYMENT', 'PAID', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED')
        .default('all')
        .messages({
            'any.only': 'Invalid order status filter.*'
        }),

    sortOrder: Joi.string()
        .valid('asc', 'desc')
        .default('desc')
        .messages({
            'any.only': 'Sort order must be asc or desc.*'
        })
}).options({
    stripUnknown: true,
    convert: true,
    abortEarly: false
});

// Order ID parameter validation
const orderIdParamSchema = Joi.object({
    id: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.pattern.base': 'Invalid order ID format.*',
            'any.required': 'Order ID is required.*'
        })
});

module.exports = {
    checkoutSchema,
    processPaymentSchema,
    orderListQuerySchema,
    orderIdParamSchema
};
