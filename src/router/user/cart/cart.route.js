const express = require("express");
const cartController = require("../../../controller/user/cart/cart.controller");
const { validateRequest, cartParamValidation } = require("../../../validation/user/cart/cartValidators");
const { addToCartSchema, productIdParamSchema, updateCartItemSchema } = require("../../../validation/user/cart/schema/cartValidation.schema");

const cartRouter = express.Router();

cartRouter.get("/cart", cartController.getCart);
cartRouter.post("/add-to-cart", validateRequest(addToCartSchema), cartController.addToCart);
cartRouter.put("/items/:productId", cartParamValidation(productIdParamSchema), validateRequest(updateCartItemSchema), cartController.updateCartItem);
cartRouter.delete("/items/:productId", cartParamValidation(productIdParamSchema), cartController.removeFromCart);
cartRouter.delete("/clear", cartController.clearCart);

module.exports = cartRouter;