const express = require("express");
const dotEnv = require("@dotenvx/dotenvx");
const { join } = require("path");
dotEnv.config();

const cors = require("cors");
const morgan = require('morgan');

const defaultErrorHandler = require("./src/middleware/common/customErrorHandlingMiddleware");
const { requestLogger } = require('./src/utility/logger/logger.utility.js');
const sequelize = require("./src/config/db.js");
const v1MainLoadRouter = require("./src/router/v1load.route.js");
const setupSwaggerDocs = require("./src/swagger/docs.js");
const { healthCheck } = require("./src/controller/health.controller.js");

const app = express();

const port = process.env.PORT || 8080;

app.use(cors({ origin: "*" }));
app.use(morgan("dev"));
app.use(requestLogger);
app.use(express.urlencoded({ limit: "100mb", extended: false }));
app.use(express.json({ limit: "100mb" }));
app.use(express.static(join(__dirname, "/public/")));
// Swagger init
setupSwaggerDocs(app);
// MY-SQL CONNECTION CHECK
sequelize.authenticate()
    .then(() => console.warn("MY-SQL connected successfully."))
    .catch(err => console.error(err));

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
