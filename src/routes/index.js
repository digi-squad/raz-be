const { Router } = require("express");
const apiv1Router = require("./v1");

const masterRouter = Router();

masterRouter.use("/apiv1", apiv1Router);

module.exports = masterRouter;
