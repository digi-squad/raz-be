const { Router } = require("express");
const authRouter = require("./auth.route");

const apiv1Router = Router();

apiv1Router.use("/auth", authRouter);

module.exports = apiv1Router;
