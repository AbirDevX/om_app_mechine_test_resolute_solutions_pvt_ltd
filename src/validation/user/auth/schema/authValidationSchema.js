const Joi = require('joi');

const registerSchema = Joi.object({
    full_name: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.min': 'Full name must be at least 2 characters.*',
            'string.max': 'Full name cannot exceed 100 characters.*',
            'any.required': 'Full name is required.*'
        })
        .custom((value, helpers) => {
            const sanitized = value
                .replace(/<[^>]*>/g, '')
                .replace(/[<>'"]/g, '')
                .trim();
            return sanitized;
        }),
    
    username: Joi.string()
        .trim()
        .min(3)
        .max(50)
        .alphanum()
        .required()
        .messages({
            'string.min': 'Username must be at least 3 characters.*',
            'string.max': 'Username cannot exceed 50 characters.*',
            'string.alphanum': 'Username must contain only alphanumeric characters.*',
            'any.required': 'Username is required.*'
        }),
    
    email: Joi.string()
        .email()
        .trim()
        .lowercase()
        .max(255)
        .required()
        .messages({
            'string.email': 'Please provide a valid email address.*',
            'string.max': 'Email cannot exceed 255 characters.*',
            'any.required': 'Email is required.*'
        }),
    
    mobile: Joi.string()
        .pattern(/^[6-9]\d{9}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Mobile number must be a valid 10-digit Indian number.*'
        }),
    
    password: Joi.string()
        .min(8)
        .max(128)
        .required()
        .messages({
            'string.min': 'Password must be at least 8 characters.*',
            'string.max': 'Password cannot exceed 128 characters.*',
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.*',
            'any.required': 'Password is required.*'
        })
}).options({
    stripUnknown: true,
    convert: true,
    abortEarly: false
});

const loginSchema = Joi.object({
    identifier: Joi.string()
        .trim()
        .required()
        .messages({
            'any.required': 'Email or username is required.*'
        })
        .custom((value, helpers) => {
            // Check if it's email or username
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const usernamePattern = /^[a-zA-Z0-9]{3,50}$/;
            
            if (emailPattern.test(value) || usernamePattern.test(value)) {
                return value.toLowerCase();
            }
            
            return helpers.error('string.pattern.base');
        }, 'Email or username validation')
        .messages({
            'string.pattern.base': 'Please provide a valid email or username.*'
        }),
    
    password: Joi.string()
        .min(1)
        .max(128)
        .required()
        .messages({
            'string.min': 'Password is required.*',
            'any.required': 'Password is required.*'
        })
}).options({
    stripUnknown: true,
    convert: true,
    abortEarly: false
});

module.exports = {
    registerSchema,
    loginSchema
};
