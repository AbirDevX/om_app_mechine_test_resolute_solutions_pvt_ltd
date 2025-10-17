const express = require("express");
const productController = require("../../../controller/product/product.controller");
const { productListValidation } = require("../../../validation/user/product/productListValidation");
const { productListQuerySchema } = require("../../../validation/user/product/schema/productListValidationSchema");

const productRouter = express.Router();

// productRouter.post("/add", addProductValidation(createProductSchema), productController.create);
productRouter.get("/list", productListValidation(productListQuerySchema), productController.list);

module.exports = productRouter;