const productQueryValidation = (schema) => {
    return async (req, res, next) => {
        try {
            const options = {
                abortEarly: false,
                allowUnknown: false,
                stripUnknown: true,
                convert: true
            };

            // For GET requests, we validate req.query instead of req.body
            // If no query parameters are provided, use empty object
            const queryParams = req.query || {};

            // Validate and sanitize query parameters
            const validated = await schema.validateAsync(queryParams, options);

            // Replace original query with sanitized version
            req.originalQuery = req.query;  // Keep original for debugging if needed
            req.query = validated;          // Use sanitized version

            next();
        } catch (error) {
            const formattedErrors = error.details.map(err => ({
                field: err.path.join('.'),
                value: err.context?.value,
                message: err.message
            }));

            return res.status(422).json({
                success: false,
                message: 'Query parameter validation failed',
                data: formattedErrors,
                status_code: 422
            });
        }
    };
};

// Also include route parameter validation
const productParamValidation = (schema) => {
    return async (req, res, next) => {
        try {
            const options = {
                abortEarly: false,
                allowUnknown: false,
                stripUnknown: true,
                convert: true
            };

            // Validate route parameters (like :id)
            const params = req.params || {};

            // Validate and sanitize route parameters
            const validated = await schema.validateAsync(params, options);

            // Replace original params with sanitized version
            req.originalParams = req.params;  // Keep original for debugging if needed
            req.params = validated;           // Use sanitized version

            next();
        } catch (error) {
            const formattedErrors = error.details.map(err => ({
                field: err.path.join('.'),
                value: err.context?.value,
                message: err.message
            }));

            return res.status(422).json({
                success: false,
                message: 'Route parameter validation failed',
                data: formattedErrors,
                status_code: 422
            });
        }
    };
};

// Generic validation middleware (can handle body, query, or params)
const validateRequest = (schema, type = 'body') => {
    return async (req, res, next) => {
        try {
            const options = {
                abortEarly: false,
                allowUnknown: false,
                stripUnknown: true,
                convert: true
            };

            let dataToValidate;
            let validationType;

            // Determine what to validate based on type
            switch (type) {
                case 'query':
                    dataToValidate = req.query || {};
                    validationType = 'Query parameter';
                    break;
                case 'params':
                    dataToValidate = req.params || {};
                    validationType = 'Route parameter';
                    break;
                case 'body':
                default:
                    // For body validation, check if body exists and is not empty
                    if (!req.body || Object.keys(req.body).length === 0) {
                        return res.status(400).json({
                            success: false,
                            message: 'Request body is required',
                            status_code: 400,
                            error: 'empty_request_body'
                        });
                    }
                    dataToValidate = req.body;
                    validationType = 'Request body';
                    break;
            }

            // Validate and sanitize data
            const validated = await schema.validateAsync(dataToValidate, options);

            // Replace original data with sanitized version
            if (type === 'query') {
                req.originalQuery = req.query;
                req.query = validated;
            } else if (type === 'params') {
                req.originalParams = req.params;
                req.params = validated;
            } else {
                req.originalBody = req.body;
                req.body = validated;
            }

            next();
        } catch (error) {
            const formattedErrors = error.details.map(err => ({
                field: err.path.join('.'),
                value: err.context?.value,
                message: err.message
            }));

            return res.status(422).json({
                success: false,
                message: `${validationType} validation failed`,
                data: formattedErrors,
                status_code: 422
            });
        }
    };
};

module.exports = { 
    productQueryValidation, 
    productParamValidation,
    validateRequest 
};
