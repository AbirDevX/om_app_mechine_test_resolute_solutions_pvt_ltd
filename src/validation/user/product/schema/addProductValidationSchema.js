const Joi = require('joi');

// Product creation validation schema
const createProductSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(3)
        .max(255)
        .required()
        .messages({
            'string.min': 'Product name must be at least 3 characters.*',
            'string.max': 'Product name cannot exceed 255 characters.*',
            'any.required': 'Product name is required.*'
        })
        .custom((value, helpers) => {
            // Sanitize HTML and special characters
            const sanitized = value
                .replace(/<[^>]*>/g, '')
                .replace(/[<>'"]/g, '')
                .replace(/\s+/g, ' ')
                .trim();
            return sanitized;
        }),
    
    price: Joi.number()
        .positive()
        .precision(2)
        .min(0.01)
        .max(99999999.99)
        .required()
        .messages({
            'number.positive': 'Price must be a positive number.*',
            'number.precision': 'Price can have maximum 2 decimal places.*',
            'number.min': 'Price must be at least 0.01.*',
            'number.max': 'Price cannot exceed 99,999,999.99.*',
            'any.required': 'Price is required.*'
        }),
    
    stock: Joi.number()
        .integer()
        .min(0)
        .max(999999)
        .required()
        .messages({
            'number.integer': 'Stock must be an integer.*',
            'number.min': 'Stock cannot be negative.*',
            'number.max': 'Stock cannot exceed 999,999.*',
            'any.required': 'Stock is required.*'
        }),
    
    description: Joi.string()
        .trim()
        .min(10)
        .max(1000)
        .optional()
        .allow('')
        .messages({
            'string.min': 'Description must be at least 10 characters.*',
            'string.max': 'Description cannot exceed 1000 characters.*'
        })
        .custom((value, helpers) => {
            if (value) {
                // Basic HTML sanitization
                const sanitized = value
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    .replace(/<[^>]*>/g, '')
                    .replace(/[<>'"]/g, '')
                    .replace(/\s+/g, ' ')
                    .trim();
                return sanitized;
            }
            return value;
        }),
    
}).options({
    stripUnknown: true,
    convert: true,
    abortEarly: false
});


module.exports = {
    createProductSchema,
};
