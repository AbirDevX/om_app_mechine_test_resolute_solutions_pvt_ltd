const express = require("express");
const orderController = require("../../../controller/user/order/order.controller");
const { validateRequest, orderParamValidation, orderQueryValidation } = require("../../../validation/user/order/orderValidator");
const { checkoutSchema, orderIdParamSchema, processPaymentSchema, orderListQuerySchema } = require("../../../validation/user/order/schema/orderValidationSchema");

const orderRouter = express.Router();

orderRouter.post("/checkout", validateRequest(checkoutSchema), orderController.checkout);
orderRouter.post("/:id/pay", orderParamValidation(orderIdParamSchema), validateRequest(processPaymentSchema), orderController.processPayment);
orderRouter.get("/list", orderQueryValidation(orderListQuerySchema), orderController.getUserOrders);
orderRouter.get("/single/:id", orderParamValidation(orderIdParamSchema), orderController.getOrderById);
orderRouter.get("/list", orderQueryValidation(orderListQuerySchema), orderController.getUserOrders);

module.exports = orderRouter;