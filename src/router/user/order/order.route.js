const express = require("express");
const orderController = require("../../../controller/order/order.controller");
const { createOrderValidation } = require("../../../validation/user/order/createOrderValidation");
const { createOrderSchema, orderListQuerySchema } = require("../../../validation/user/order/schema/orderValidationSchema");
const { orderListValidation } = require("../../../validation/user/order/orderListValidation");

const orderRouter = express.Router();

// orderRouter.post("/create", createOrderValidation(createOrderSchema), orderController.create);
// orderRouter.get("/list", orderListValidation(orderListQuerySchema), orderController.list);

module.exports = orderRouter;