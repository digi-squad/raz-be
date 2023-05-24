const { Router } = require("express");
const apiv1Router = require("./v1");
const productsRouter = require("../routes/v1/product.route");
const masterRouter = Router();


masterRouter.use("/apiv1", apiv1Router);
masterRouter.use("/products", productsRouter);

module.exports = masterRouter;
