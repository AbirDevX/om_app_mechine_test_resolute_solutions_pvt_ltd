const express = require("express");
const productController = require("../../controller/product/product.controller");
const { productListValidation } = require("../../validation/product/productListValidation");
const { productListQuerySchema } = require("../../validation/product/schema/productListValidationSchema");
const { addProductValidation } = require("../../validation/product/productAddValidation");
const { createProductSchema } = require("../../validation/product/schema/addProductValidationSchema");

const productRouter = express.Router();

productRouter.post("/add", addProductValidation(createProductSchema), productController.create);
productRouter.get("/list", productListValidation(productListQuerySchema), productController.list);

module.exports = productRouter;