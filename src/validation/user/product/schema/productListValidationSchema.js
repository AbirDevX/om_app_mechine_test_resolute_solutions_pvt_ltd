const Joi = require('joi');

const productListQuerySchema = Joi.object({
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

    searchQuery: Joi.string()
        .trim()
        .min(1)
        .max(100)
        .allow('')
        .optional()
        .messages({
            'string.min': 'Search query must be at least 1 character.*',
            'string.max': 'Search query cannot exceed 100 characters.*'
        })
        .custom((value, helpers) => {
            // Additional sanitization: remove HTML tags and special chars
            if (value) {
                const sanitized = value
                    .replace(/<[^>]*>/g, '')           // Remove HTML tags
                    .replace(/[<>'"]/g, '')            // Remove dangerous chars
                    .replace(/\s+/g, ' ')              // Normalize spaces
                    .trim();

                if (sanitized !== value) {
                    return sanitized;
                }
            }
            return value;
        }, 'HTML sanitization'),

    // Optional: Add sorting parameters
    sortBy: Joi.string()
        .valid('name', 'price', 'stock', 'created_at')
        .default('id')
        .messages({
            'any.only': 'Sort field must be one of: name, price, stock, created_at.*'
        }),

    sortOrder: Joi.string()
        .valid('ASC', 'DESC', 'asc', 'desc')
        .default('DESC')
        .uppercase()      // Convert to uppercase for consistency
        .messages({
            'any.only': 'Sort order must be ASC or DESC.*'
        })
}).options({
    stripUnknown: true,    // Remove unknown fields
    convert: true,         // Auto-convert types
    abortEarly: false      // Show all errors
});

module.exports = {
    productListQuerySchema
};
