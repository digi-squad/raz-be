const userPanelModel = require("../../models/v1/userPanel.model");
const authModel = require("../../models/v1/auth.model");
const { uploader } = require("../../utils/cloudinary");

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

    // validation
    const { email, name, store_name, store_desc, gender } = req.body;
    const regexEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
    if (email && !email.match(regexEmail))
      return res.status(422).json({ msg: "INVALID_EMAIL" });
    if (store_name && store_name.length < 3)
      return res.status(422).json({ msg: "STORE_NAME_MINIMUM_3_CHAR" });
    if (gender && !gender.match(/^[12]$/))
      return res.status(422).json({ msg: "INVALID_GENDER" });

    const checkEmail = await authModel.checkEmail(email);
    if (checkEmail.rows.length > 0)
      return res.status(409).json({ msg: "EMAIL_ALREADY_REGISTERED" });

    const uploadImage = await uploader(req.file, "profile", id);
    if (uploadImage.err) throw { msg: uploadImage.msg, err: uploadImage.err };
    await userPanelModel.editProfile(id, req.body, uploadImage);
    res.status(200).json({ msg: "PROFILE_UPDATED" });
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
    if (
      error.message ===
      `column "product_id" of relation "products" does not exist`
    )
      return res.status(404).json({
        msg: "PRODUCT_NOT_EXIST",
      });
    if (
      error.message ===
      `duplicate key value violates unique constraint "user_wishlist_unique"`
    )
      return res.status(422).json({
        msg: "THIS_PRODUCT_ALREADY_ON_WISHLIST",
      });
    res.status(500).json({
      msg: "INTERNAL_SERVER_ERROR",
    });
  }
};

const deleteWishlist = async (req, res) => {
  try {
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      msg: "INTERNAL_SERVER_ERROR",
    });
  }
};

module.exports = {
  getProfile,
  editProfile,
  getWishlists,
  addWishlist,
  deleteWishlist,
};
