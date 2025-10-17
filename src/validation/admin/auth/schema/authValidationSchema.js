const Joi = require('joi');

const loginSchema = Joi.object({
    email: Joi.string()
        .trim()
        .required()
        .messages({
            'any.required': 'Email or username is required.*'
        })
        .custom((value, helpers) => {
            // Check if it's email or username
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (emailPattern.test(value)) {
                return value.toLowerCase();
            }

            return helpers.error('string.pattern.base');
        }, 'Email validation')
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
    loginSchema
};
