const express = require("express");
const dotEnv = require("@dotenvx/dotenvx");
const { join } = require("path");
dotEnv.config();

const cors = require("cors");
const morgan = require('morgan');

const defaultErrorHandler = require("./src/middleware/common/customErrorHandlingMiddleware");
const v1MainLoadRouter = require("./src/router/v1load.route.js");
const setupSwaggerDocs = require("./src/swagger/docs.js");
const { healthCheck } = require("./src/controller/health.controller.js");
const connectToMongoDb = require("./src/config/mongo.config.js");

const app = express();

const port = process.env.PORT || 8080;

app.use(cors({ origin: "*" }));
app.use(morgan("dev"));
app.use(express.urlencoded({ limit: "100mb", extended: false }));
app.use(express.json({ limit: "100mb" }));
app.use(express.static(join(__dirname, "/public/")));
// Swagger init
setupSwaggerDocs(app);
// CONNECT TO MONGO-DB
connectToMongoDb()
// ROUTES
app.use("/health", healthCheck);
app.use("/api/v1", v1MainLoadRouter);
// Custom Error-Handler Middleware's
app.use(defaultErrorHandler.notFoundHandler);
app.use(defaultErrorHandler.customErrorHandlingMiddleware);

// LISTING THE SERVER
app.listen(port, () => {
    console.log(`Server Is Running On http://localhost:${port}`);
});
