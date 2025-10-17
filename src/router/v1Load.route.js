const express = require('express');
const isAuthorizedUserMiddleware = require('../middleware/auth/isAuthorizedUser.middleware');

const v1MainLoadRouter = express.Router();

const defaultRoutes = [
    {
        prefix: "/auth",
        route: require("./auth/auth.route")
    },
    // {
    //     prefix: "/product",
    //     route: require("./product/product.route")
    // },
    // {
    //     prefix: "/order",
    //     route: require("./order/order.route"),
    //     middleware: isAuthorizedUserMiddleware
    // }
];

defaultRoutes.forEach((route) => {
    if (route.middleware) {
        v1MainLoadRouter.use(route.prefix, route.middleware, route.route);
    } else {
        v1MainLoadRouter.use(route.prefix, route.route);
    }
});

module.exports = v1MainLoadRouter;