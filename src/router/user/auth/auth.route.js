const express = require("express");
const authController = require("../../../controller/user/auth/auth.controller");
const { loginValidation } = require("../../../validation/user/auth/loginValidation");
const { registerValidation } = require("../../../validation/user/auth/registerValidation");
const { registerSchema, loginSchema } = require("../../../validation/user/auth/schema/authValidationSchema");

const authRouter = express.Router();

authRouter.post("/login", loginValidation(loginSchema), authController.login);
authRouter.post("/register", registerValidation(registerSchema), authController.register);

module.exports = authRouter;