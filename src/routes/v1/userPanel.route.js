const { Router } = require("express");
const userPanelController = require("../../controllers/v1/userPanel.controller");
const auth = require("../../middlewares/auth");
const singleUpload = require("../../middlewares/singleUpload");

const userPanelRouter = Router();

userPanelRouter.get("/profile", auth.check, userPanelController.getProfile);
userPanelRouter.patch(
  "/profile",
  auth.check,
  singleUpload.single("image"),
  userPanelController.editProfile
);

// wishlists
userPanelRouter.get("/wishlist", auth.check, userPanelController.getWishlists);
userPanelRouter.post("/wishlist", auth.check, userPanelController.addWishlist);
userPanelRouter.delete(
  "/wishlist/:id",
  auth.check,
  userPanelController.deleteWishlist
);

module.exports = userPanelRouter;
