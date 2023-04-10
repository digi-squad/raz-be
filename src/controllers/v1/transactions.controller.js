const addTransaction = async (req, res) => {
  try {
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      msg: "INTERNAL_SERVER_ERROR",
    });
  }
};
module.exports = {
  addTransaction,
};
