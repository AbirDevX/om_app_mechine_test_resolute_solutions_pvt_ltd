const Joi = require('joi');

// Add to cart validation schema
const addToCartSchema = Joi.object({
    productId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.pattern.base': 'Invalid product ID format.*',
            'any.required': 'Product ID is required.*'
        }),
    
    quantity: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(1)
        .messages({
            'number.integer': 'Quantity must be an integer.*',
            'number.min': 'Quantity must be at least 1.*',
            'number.max': 'Quantity cannot exceed 100.*'
        })
}).options({
    stripUnknown: true,
    convert: true,
    abortEarly: false
});

// Update cart item validation schema
const updateCartItemSchema = Joi.object({
    quantity: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .required()
        .messages({
            'number.integer': 'Quantity must be an integer.*',
            'number.min': 'Quantity must be at least 1.*',
            'number.max': 'Quantity cannot exceed 100.*',
            'any.required': 'Quantity is required.*'
        })
}).options({
    stripUnknown: true,
    convert: true,
    abortEarly: false
});

// Product ID parameter validation
const productIdParamSchema = Joi.object({
    productId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.pattern.base': 'Invalid product ID format.*',
            'any.required': 'Product ID is required.*'
        })
});

module.exports = {
    addToCartSchema,
    updateCartItemSchema,
    productIdParamSchema
};
