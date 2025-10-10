const addProductValidation = (schema) => {
    return async (req, res, next) => {
        try {
            const options = {
                abortEarly: false,
                allowUnknown: false,
                stripUnknown: true,
                convert: true
            };

            // Validate and sanitize query parameters
            const validated = await schema.validateAsync(req.body, options);

            // Replace original query with sanitized version
            req.body = validated;

            next();
        } catch (error) {
            const formattedErrors = error.details.map(err => ({
                field: err.path.join('.'),
                value: err.context?.value,
                message: err.message
            }));

            return res.status(422).json({
                success: false,
                message: 'Query validation failed',
                data: formattedErrors,
                status_code: 422
            });
        }
    };
};

module.exports = { addProductValidation };
