const { Router } = require("express");
const authRouter = require("./auth.route");
const userPanelRouter = require("./userPanel.route");

const apiv1Router = Router();

apiv1Router.use("/auth", authRouter);
apiv1Router.use("/userPanel", userPanelRouter);

module.exports = apiv1Router;
