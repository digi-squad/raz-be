const userPanelModel = require("../../models/v1/userPanel.model");

const getProfile = async (req, res) => {
  try {
    const { id, role } = req.authInfo;
    const result = await userPanelModel.getProfile(id, role);
    res.status(200).json({
      data: result.rows,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      msg: "INTERNAL_SERVER_ERROR",
    });
  }
};

const editProfile = async (req, res) => {
  try {
    const { id } = req.authInfo;
    await userPanelModel.editProfile(id, req.body);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      msg: "INTERNAL_SERVER_ERROR",
    });
  }
};

const getWishlists = async (req, res) => {
  try {
    const { id } = req.authInfo;
    const result = await userPanelModel.getWishlists(id);
    if (result.rows.length < 1)
      return res.status(200).json({
        data: result.rows,
        msg: "WISHLIST_EMPTY",
      });
    res.status(200).json({
      data: result.rows,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      msg: "INTERNAL_SERVER_ERROR",
    });
  }
};

const addWishlist = async (req, res) => {
  try {
    const { id } = req.authInfo;
    const { product_id } = req.body;
    await userPanelModel.addWishlist(id, product_id);
    res.status(201).json({
      msg: "WISHLIST_ADDED",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      msg: "INTERNAL_SERVER_ERROR",
    });
  }
};

module.exports = { getProfile, editProfile, getWishlists, addWishlist };
