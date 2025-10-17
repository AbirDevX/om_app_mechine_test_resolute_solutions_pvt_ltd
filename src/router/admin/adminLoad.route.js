const express = require('express');
const isAdminMiddleware = require('../../middleware/auth/isAdmin.middleware');

const adminLoadRouter = express.Router();

const defaultRoutes = [
    {
        prefix: "/auth",
        route: require("./auth/adminAuth.route")
    },
    {
        prefix: "/product-manage",
        route: require("./productManage/productManage.route"),
        middleware: isAdminMiddleware
    }
];

defaultRoutes.forEach((route) => {
    if (route.middleware) {
        adminLoadRouter.use(route.prefix, route.middleware, route.route);
    } else {
        adminLoadRouter.use(route.prefix, route.route);
    }
});

module.exports = adminLoadRouter;