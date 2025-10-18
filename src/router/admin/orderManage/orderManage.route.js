const express = require("express");
const orderManageController = require("../../../controller/admin/orderManage.controller");
const { orderQueryValidation, orderParamValidation, validateRequest } = require("../../../validation/admin/order/orderValidaor");
const { adminOrderListQuerySchema, orderIdParamSchema, updateOrderStatusSchema } = require("../../../validation/admin/order/schema/orderValidation.schema");

const orderManageRouter = express.Router();

orderManageRouter.get("/list", orderQueryValidation(adminOrderListQuerySchema), orderManageController.getAllOrders);
orderManageRouter.get("/details/:id", orderParamValidation(orderIdParamSchema), orderManageController.getOrderById);
orderManageRouter.patch("/update/:id/status", orderParamValidation(orderIdParamSchema), validateRequest(updateOrderStatusSchema), orderManageController.updateOrderStatus);

module.exports = orderManageRouter;