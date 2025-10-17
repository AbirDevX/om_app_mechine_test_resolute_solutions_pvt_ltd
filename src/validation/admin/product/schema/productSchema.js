const Joi = require('joi');

// Create product validation schema (only fields in your schema)
const createProductSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .max(255)
        .required()
        .messages({
            'string.min': 'Product name must be at least 2 characters.*',
            'string.max': 'Product name cannot exceed 255 characters.*',
            'any.required': 'Product name is required.*'
        }),

    price: Joi.number()
        .positive()
        .precision(2)
        .min(0.01)
        .max(999999.99)
        .required()
        .messages({
            'number.positive': 'Price must be a positive number.*',
            'number.precision': 'Price can have maximum 2 decimal places.*',
            'number.min': 'Price must be at least 0.01.*',
            'number.max': 'Price cannot exceed 999,999.99.*',
            'any.required': 'Price is required.*'
        }),

    totalStock: Joi.number()
        .integer()
        .min(0)
        .max(999999)
        .required()
        .messages({
            'number.integer': 'Total stock must be an integer.*',
            'number.min': 'Total stock cannot be negative.*',
            'number.max': 'Total stock cannot exceed 999,999.*',
            'any.required': 'Total stock is required.*'
        }),

    description: Joi.string()
        .trim()
        .max(1000)
        .allow('')
        .optional()
        .messages({
            'string.max': 'Description cannot exceed 1000 characters.*'
        })
}).options({
    stripUnknown: true,
    convert: true,
    abortEarly: false
});

// Update product validation schema (all fields optional)
const updateProductSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .max(255)
        .optional()
        .messages({
            'string.min': 'Product name must be at least 2 characters.*',
            'string.max': 'Product name cannot exceed 255 characters.*'
        }),

    price: Joi.number()
        .positive()
        .precision(2)
        .min(0.01)
        .max(999999.99)
        .optional()
        .messages({
            'number.positive': 'Price must be a positive number.*',
            'number.precision': 'Price can have maximum 2 decimal places.*',
            'number.min': 'Price must be at least 0.01.*',
            'number.max': 'Price cannot exceed 999,999.99.*'
        }),

    totalStock: Joi.number()
        .integer()
        .min(0)
        .max(999999)
        .optional()
        .messages({
            'number.integer': 'Total stock must be an integer.*',
            'number.min': 'Total stock cannot be negative.*',
            'number.max': 'Total stock cannot exceed 999,999.*'
        }),

    description: Joi.string()
        .trim()
        .max(1000)
        .allow('')
        .optional()
        .messages({
            'string.max': 'Description cannot exceed 1000 characters.*'
        }),

    status: Joi.number()
        .integer()
        .valid(0, 1)
        .optional()
        .messages({
            'any.only': 'Status must be 0 (inactive) or 1 (active).*'
        })
}).options({
    stripUnknown: true,
    convert: true,
    abortEarly: false
});

// Public product list query validation
const publicProductListQuerySchema = Joi.object({
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
        .default(12)
        .messages({
            'number.integer': 'Limit must be an integer.*',
            'number.min': 'Limit must be at least 1.*',
            'number.max': 'Limit cannot exceed 100.*'
        }),

    sortBy: Joi.string()
        .valid('name', 'price', 'createdAt')
        .default('name')
        .messages({
            'any.only': 'Sort by must be one of: name, price, createdAt.*'
        }),

    sortOrder: Joi.string()
        .valid('asc', 'desc')
        .default('asc')
        .messages({
            'any.only': 'Sort order must be asc or desc.*'
        }),

    name: Joi.string()
        .trim()
        .max(100)
        .allow('')
        .optional()
        .messages({
            'string.max': 'Name filter cannot exceed 100 characters.*'
        }),

    minPrice: Joi.number()
        .positive()
        .precision(2)
        .optional()
        .messages({
            'number.positive': 'Minimum price must be positive.*',
            'number.precision': 'Minimum price can have maximum 2 decimal places.*'
        }),

    maxPrice: Joi.number()
        .positive()
        .precision(2)
        .optional()
        .messages({
            'number.positive': 'Maximum price must be positive.*',
            'number.precision': 'Maximum price can have maximum 2 decimal places.*'
        })
}).custom((value, helpers) => {
    // Validate that maxPrice is greater than minPrice
    if (value.minPrice && value.maxPrice && value.minPrice >= value.maxPrice) {
        return helpers.error('any.invalid', {
            message: 'Maximum price must be greater than minimum price.*'
        });
    }
    return value;
}).options({
    stripUnknown: true,
    convert: true,
    abortEarly: false
});
module.exports = {
    createProductSchema,
    updateProductSchema,
    publicProductListQuerySchema
};
