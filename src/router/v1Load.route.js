const express = require('express');
const isAuthorizedUserMiddleware = require('../middleware/auth/isAuthorizedUser.middleware');

const v1MainLoadRouter = express.Router();

const defaultRoutes = [
    {
        prefix: "/user",
        route: require("./user/userLoad.route")
    },
    {
        prefix: "/admin",
        route: require("./admin/adminLoad.route")
    },
];

defaultRoutes.forEach((route) => {
    if (route.middleware) {
        v1MainLoadRouter.use(route.prefix, route.middleware, route.route);
    } else {
        v1MainLoadRouter.use(route.prefix, route.route);
    }
});

module.exports = v1MainLoadRouter;