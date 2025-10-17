const express = require('express');
const isAuthorizedUserMiddleware = require('../../middleware/auth/isAuthorizedUser.middleware');

const userLoadRouter = express.Router();

const defaultRoutes = [
    {
        prefix: "/auth",
        route: require("./auth/auth.route")
    },
    {
        prefix: "/product",
        route: require("./product/product.route"),
        // middleware: isAuthorizedUserMiddleware
    },
    {
        prefix: "/order",
        route: require("./order/order.route"),
        middleware: isAuthorizedUserMiddleware
    }
];

defaultRoutes.forEach((route) => {
    if (route.middleware) {
        userLoadRouter.use(route.prefix, route.middleware, route.route);
    } else {
        userLoadRouter.use(route.prefix, route.route);
    }
});

module.exports = userLoadRouter;