const express = require("express");
const productManageController = require("../../../controller/admin/productManage.controller");
const { validateRequest, productQueryValidation } = require("../../../validation/admin/product/product.validation");
const { createProductSchema, updateProductSchema, publicProductListQuerySchema } = require("../../../validation/admin/product/schema/productSchema");

const productManageRouter = express.Router();

productManageRouter.post("/add", validateRequest(createProductSchema), productManageController.create);
productManageRouter.put("/update/:id", validateRequest(updateProductSchema), productManageController.update);
productManageRouter.get("/products", productQueryValidation(publicProductListQuerySchema), productManageController.list);
productManageRouter.get("/detail/:id", productManageController.getById);
productManageRouter.delete("/delete/:id", productManageController.delete);

module.exports = productManageRouter;