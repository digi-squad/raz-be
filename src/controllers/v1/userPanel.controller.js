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

module.exports = { getProfile, editProfile };
