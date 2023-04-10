const { Router } = require("express");
const productRouter = Router();
const productController = require("../../controllers/v1/product.controller");
const memoryUpload = require("../../middlewares/memoryUpload");
const auth = require("../../middlewares/auth");

productRouter.get("/", productController.getProduct);

productRouter.post(
  "/",
  auth.check,
  auth.seller,
  memoryUpload,
  productController.cloudUpload,
  productController.insertProduct
); // add new porducts
productRouter.patch(
  "/:id",
  memoryUpload,
  productController.cloudUpload,
  productController.updateProduct
);
module.exports = productRouter;

productRouter.get("/:id", productController.getProductDetail);
productRouter.delete("/:id", productController.deleteProduct);
