const { Router } = require("express");
const authController = require("../../controllers/v1/auth.controller");

const authRouter = Router();

authRouter.use("/register", authController.register);

module.exports = authRouter;
