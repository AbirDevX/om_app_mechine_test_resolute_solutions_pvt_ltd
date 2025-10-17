const Joi = require('joi');

const createOrderSchema = Joi.object({
    userName: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.min': 'User name must be at least 2 characters.*',
            'string.max': 'User name cannot exceed 100 characters.*',
            'any.required': 'User name is required.*'
        })
        .custom((value, helpers) => {
            // Sanitize HTML and special characters
            const sanitized = value
                .replace(/<[^>]*>/g, '')
                .replace(/[<>'"]/g, '')
                .trim();
            return sanitized;
        }),

    products: Joi.array()
        .items(
            Joi.object({
                productId: Joi.number()
                    .integer()
                    .positive()
                    .required()
                    .messages({
                        'number.integer': 'Product ID must be an integer.*',
                        'number.positive': 'Product ID must be positive.*',
                        'any.required': 'Product ID is required.*'
                    }),

                qty: Joi.number()
                    .integer()
                    .min(1)
                    .max(1000)
                    .required()
                    .messages({
                        'number.integer': 'Quantity must be an integer.*',
                        'number.min': 'Quantity must be at least 1.*',
                        'number.max': 'Quantity cannot exceed 1000.*',
                        'any.required': 'Quantity is required.*'
                    })
            })
        )
        .min(1)
        .max(50)
        .required()
        .messages({
            'array.min': 'At least one product is required.*',
            'array.max': 'Maximum 50 products allowed per order.*',
            'any.required': 'Products array is required.*'
        }),

    notes: Joi.string()
        .trim()
        .max(500)
        .allow('')
        .optional()
        .messages({
            'string.max': 'Notes cannot exceed 500 characters.*'
        })
        .custom((value, helpers) => {
            if (value) {
                const sanitized = value
                    .replace(/<[^>]*>/g, '')
                    .replace(/[<>'"]/g, '')
                    .trim();
                return sanitized;
            }
            return value;
        })
}).options({
    stripUnknown: true,
    convert: true,
    abortEarly: false
});

const orderListQuerySchema = Joi.object({
    page: Joi.number()
        .integer()
        .min(1)
        .default(1)
        .messages({
            'number.base': 'Page must be a number.*',
            'number.integer': 'Page must be an integer.*',
            'number.min': 'Page must be at least 1.*'
        }),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10)
        .messages({
            'number.base': 'Limit must be a number.*',
            'number.integer': 'Limit must be an integer.*',
            'number.min': 'Limit must be at least 1.*',
            'number.max': 'Limit cannot exceed 100.*'
        }),

    // Order status filter
    orderStatus: Joi.string()
        .valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')
        .optional()
        .messages({
            'any.only': 'Order status must be one of: pending, confirmed, processing, shipped, delivered, cancelled.*'
        }),

    // Payment status filter
    paymentStatus: Joi.string()
        .valid('pending', 'paid', 'failed', 'refunded')
        .optional()
        .messages({
            'any.only': 'Payment status must be one of: pending, paid, failed, refunded.*'
        }),


    // Date range filters
    startDate: Joi.date()
        .iso()
        .optional()
        .messages({
            'date.base': 'Start date must be a valid date.*',
            'date.format': 'Start date must be in ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ).*'
        }),

    endDate: Joi.date()
        .iso()
        .greater(Joi.ref('startDate'))
        .optional()
        .messages({
            'date.base': 'End date must be a valid date.*',
            'date.format': 'End date must be in ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ).*',
            'date.greater': 'End date must be after start date.*'
        }),
}).options({
    stripUnknown: true,
    convert: true,
    abortEarly: false
});


module.exports = {
    createOrderSchema,
    orderListQuerySchema
};
