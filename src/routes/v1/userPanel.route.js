const { Router } = require("express");
const userPanelController = require("../../controllers/v1/userPanel.controller");
const auth = require("../../middlewares/auth");

const userPanelRouter = Router();

userPanelRouter.get("/profile", auth.check, userPanelController.getProfile);
userPanelRouter.patch("/profile", auth.check, userPanelController.editProfile);

// wishlists
userPanelRouter.get("/wishlist", auth.check, userPanelController.getWishlists);
userPanelRouter.post("/wishlist", auth.check, userPanelController.addWishlist);

module.exports = userPanelRouter;