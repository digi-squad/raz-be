const { Router } = require("express");
const apiv1Router = require("./v1");
const productsRouter = require("../routes/v1/product.route");
const masterRouter = Router();


masterRouter.use("/apiv1", apiv1Router);
masterRouter.use("/products", productsRouter);

masterRouter.get("/", (req, res) => {
  res.status(200).json({
    status: 200,
    msg: "Welcome to RAZ Shop Rest API",
    contributors: ["nyannss", "raihanirvana", "PriaAdmaja", "wyakaga"],
  });
});

module.exports = masterRouter;
