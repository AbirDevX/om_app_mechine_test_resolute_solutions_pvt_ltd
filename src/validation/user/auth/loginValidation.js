const loginValidation = (schema) => {
    return async (req, res, next) => {
        try {
            const options = {
                abortEarly: false,
                allowUnknown: false,
                stripUnknown: true,
                convert: true
            };

            if (!req.body || Object.keys(req.body).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Request body is required',
                    status_code: 400,
                    error: 'empty_request_body'
                });
            }

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
                message: 'Login validation failed',
                data: formattedErrors,
                status_code: 422
            });
        }
    };
};

module.exports = { loginValidation };
