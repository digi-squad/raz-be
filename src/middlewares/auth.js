const jwt = require("jsonwebtoken");
const { jwtSecretKey } = require("../configs/env");

const check = (req, res, next) => {
  // get from header
  const authHeader = req.header("Authorization");
  if (!authHeader)
    return res.status(403).json({
      msg: "NOT_LOGGED_IN",
    });

  // throw away "Bearer" word
  const token = authHeader.split(" ")[1];

  // verify
  jwt.verify(token, jwtSecretKey, (err, payload) => {
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
const customer = () => {
  if (!req.authInfo || Number(req.authInfo.role) !== 1) {
    return res.status(403).json({
      msg: "FOR_CUSTOMER_ONLY",
    });
  }
  next();
};

// Add-ons authorization for only customer
const seller = () => {
  if (!req.authInfo || Number(req.authInfo.role) !== 2) {
    return res.status(403).json({
      msg: "FOR_SELLER_ONLY",
    });
  }
  next();
};

module.exports = { check, customer, seller };
