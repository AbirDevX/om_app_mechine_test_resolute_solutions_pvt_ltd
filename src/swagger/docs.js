const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

// Swagger config options
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: "OM-APP API's",
            version: '1.0.0',
            description: 'API documentation for Order Manage App',
            // contact: {
            //     name: 'Your Name',
            //     email: 'your@email.com'
            // }
        },
        servers: [
            {
                url: 'http://localhost:8080',
                description: 'Development Server'
            }
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [
            {
                BearerAuth: []
            }
        ]
    },
    apis: [
        path.join(__dirname, './routes/*.js'),      // Swagger docs in route files
        path.join(__dirname, './components/*.js')   // Reusable components/schemas
    ]
};

// Generate swagger spec
const swaggerSpec = swaggerJSDoc(options);

// Export function to attach to Express app
const setupSwaggerDocs = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // Optional: serve raw JSON
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
};

module.exports = setupSwaggerDocs;
