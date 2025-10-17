const express = require("express");
const adminAuthController = require("../../../controller/admin/auth.controller");
const { adminLoginValidation } = require("../../../validation/admin/auth/loginValidation");
const { loginSchema } = require("../../../validation/admin/auth/schema/authValidationSchema");

const adminAuthRouter = express.Router();

adminAuthRouter.post("/login", adminLoginValidation(loginSchema), adminAuthController.adminLogin);

module.exports = adminAuthRouter;