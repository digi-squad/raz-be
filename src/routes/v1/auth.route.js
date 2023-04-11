const { Router } = require("express");
const authController = require("../../controllers/v1/auth.controller");

const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.post("/forgotpass", authController.requestResetPass);
authRouter.get("/resetpass", authController.checkResetPass);
authRouter.patch("/resetpass", authController.resetPass);
authRouter.delete("/logout", authController.logout);

module.exports = authRouter;
