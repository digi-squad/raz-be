const mongoose = require("mongoose");
const tokenSchema = require("../../schemas/token.schema");

const Token = mongoose.model("tokens", tokenSchema);

async function store({ token, expired_at }, cb) {
  try {
    console.log(expired_at);
    await Token.create({
      token,
      expired_at,
    });
    cb(null, {
      message: "Token added to MongoDB",
    });
  } catch (err) {
    cb(err, null);
  }
}

async function get(token) {
  try {
    const tokenData = await Token.findOne({ token });
    return tokenData;
  } catch (err) {
    cb(err, null);
  }
}

async function destroy(token) {
  try {
    const tokenData = await Token.findOneAndRemove({ token });
    return tokenData;
  } catch (error) {
    console.log(error);
  }
}

module.exports = { store, get, destroy };
