const express = require("express");
const athController = require("../../controller/auth/auth.controller");
const { loginValidation } = require("../../validation/auth/loginValidation");
const { registerValidation } = require("../../validation/auth/registerValidation");
const { registerSchema, loginSchema } = require("../../validation/auth/schema/authValidationSchema");

const authRouter = express.Router();

authRouter.post("/login", loginValidation(loginSchema), athController.login);
authRouter.post("/register", registerValidation(registerSchema), athController.register);

module.exports = authRouter;