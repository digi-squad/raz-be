const jwt = require("jsonwebtoken");
const { jwtSecretKey } = require("../configs/env");
const tokenModel = require("../models/v1/token.model");

const check = async (req, res, next) => {
  // get from header
  const authHeader = req.header("Authorization");
  if (!authHeader)
    return res.status(403).json({
      msg: "NOT_LOGGED_IN",
    });

  // throw away "Bearer" word
  const token = authHeader.split(" ")[1];

  const tokenVerify = await tokenModel.get(token);
  if (!tokenVerify) {
    return res.status(403).json({
      msg: "JWT_REJECTED",
    });
  }

  // verify
  jwt.verify(token, jwtSecretKey, (err, payload) => {
    if (err && err.message === "jwt expired")
      return res.status(403).json({
        // err handling
        msg: "JWT_EXPIRED",
      });

    if (err && err.name)
      return res.status(403).json({
        // err handling
        msg: err.message,
      });
    if (err)
      return res.status(500).json({
        msg: "INTERNAL_SERVER_ERROR",
      });
    req.authInfo = payload;
    next();
  });
};

// Add-ons authorization for only customer
const customer = (req, res, next) => {
  if (!req.authInfo || parseInt(req.authInfo.role) !== 1) {
    return res.status(403).json({
      msg: "FOR_CUSTOMER_ONLY",
    });
  }
  next();
};

// Add-ons authorization for only customer
const seller = (req, res, next) => {
  if (!req.authInfo || parseInt(req.authInfo.role) !== 2) {
    return res.status(403).json({
      msg: "FOR_SELLER_ONLY",
    });
  }
  next();
};

module.exports = { check, customer, seller };
