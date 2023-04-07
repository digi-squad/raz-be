const { Router } = require("express");
const productRouter = Router();
const productController = require("../../controllers/v1/product.controller");
const memoryUpload = require("../../middlewares/memoryUpload");

productRouter.get("/", productController.getProduct);

productRouter.post(
  "/",
  memoryUpload,
  productController.cloudUpload,
  productController.insertProduct
);
productRouter.patch(
  "/:id",
  memoryUpload,
  productController.cloudUpload,
  productController.updateProduct
);
module.exports = productRouter;

productRouter.get("/:id", productController.getProductDetail);
productRouter.delete("/:id", productController.deleteProduct);
