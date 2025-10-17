const express = require("express");
const productController = require("../../../controller/user/product/product.controller");
const { productQueryValidation } = require("../../../validation/user/product/productListValidation");
const { productListQuerySchema } = require("../../../validation/user/product/schema/productListValidationSchema");

const productRouter = express.Router();

productRouter.get("/list", productQueryValidation(productListQuerySchema), productController.list);
productRouter.get("/product/:id", productController.getById);

module.exports = productRouter;