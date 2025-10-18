const Joi = require('joi');

// Admin order list query validation
const adminOrderListQuerySchema = Joi.object({
    page: Joi.number()
        .integer()
        .min(1)
        .default(1),
    
    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(20),
    
    status: Joi.string()
        .valid('all', 'PENDING_PAYMENT', 'PAID', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED')
        .default('all'),
    
    userId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Invalid user ID format.*'
        }),
    
    startDate: Joi.date()
        .iso()
        .optional()
        .messages({
            'date.format': 'Start date must be in ISO format (YYYY-MM-DD).*'
        }),
    
    endDate: Joi.date()
        .iso()
        .min(Joi.ref('startDate'))
        .optional()
        .messages({
            'date.format': 'End date must be in ISO format (YYYY-MM-DD).*',
            'date.min': 'End date must be after start date.*'
        }),
    
    sortBy: Joi.string()
        .valid('createdAt', 'updatedAt', 'totalAmount', 'orderStatus')
        .default('createdAt'),
    
    sortOrder: Joi.string()
        .valid('asc', 'desc')
        .default('desc'),
    
    search: Joi.string()
        .trim()
        .max(100)
        .allow('')
        .optional()
}).options({
    stripUnknown: true,
    convert: true,
    abortEarly: false
});

// Order status update validation
const updateOrderStatusSchema = Joi.object({
    status: Joi.string()
        .valid('PAID', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED')
        .required()
        .messages({
            'any.required': 'Order status is required.*',
            'any.only': 'Invalid order status. Allowed: PAID, SHIPPED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED.*'
        }),
    
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
    adminOrderListQuerySchema,
    updateOrderStatusSchema,
    orderIdParamSchema
};
