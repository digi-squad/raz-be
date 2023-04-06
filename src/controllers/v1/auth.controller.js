const authModel = require("../../models/v1/auth.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { jwtSecretKey } = require("../../configs/env");

const register = async (req, res) => {
  const { email, password, role } = req.body;
  const regexEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
  if (email == undefined || email === "")
    return res.status(422).json({ msg: "EMAIL_IS_REQUIRED" });
  if (!email.match(regexEmail))
    return res.status(422).json({ msg: "INVALID_EMAIL" });
  if (password == undefined || parseInt(password.length) < 8)
    return res.status(422).json({ msg: "PASSWORD_ATLEAST_8_CHAR" });
  if (role == undefined || role === "")
    return res.status(422).json({ msg: "ROLE_IS_REQUIRED" });

  try {
    // check email
    const checkEmail = await authModel.checkEmail(email);
    if (checkEmail.rows[0].count > 0)
      return res.status(409).json({ msg: "EMAIL_ALREADY_REGISTERED" });

    // check role
    const checkRole = await authModel.checkRole(role);
    if (checkRole.rows[0].register === false)
      return res.status(409).json({ msg: "INVALID_ROLE" });

    await authModel.createUser(email, password, role);
    res.status(201).json({
      msg: "USER_CREATED_SUCCESS",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      msg: "Internal server error",
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (email == undefined || email === "")
    return res.status(422).json({ msg: "EMAIL_IS_REQUIRED" });
  if (password == undefined || password === "")
    return res.status(422).json({ msg: "PASSWORD_IS_REQUIRED" });

  try {
    // check from db if email exists
    const result = await authModel.getUserByEmail(email);
    if (result.rows.length < 1)
      return res.status(401).json({
        msg: "WRONG_EMAIL_OR_PASSWORD",
      });

    // bcrypt compare password
    const isPasswordValid = await bcrypt.compare(
      password,
      result.rows[0].password
    );
    if (!isPasswordValid)
      return res.status(401).json({
        msg: "WRONG_EMAIL_OR_PASSWORD",
      });

    const payload = {
      id: result.rows[0].id,
      img: result.rows[0].img,
    };

    const jwtOptions = { expiresIn: "20m" };

    jwt.sign(payload, jwtSecretKey, jwtOptions, (err, token) => {
      if (err) throw err;
      res.status(200).json({
        msg: "LOGIN_SUCCESS",
        data: { token },
      });
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      msg: "Internal server error",
    });
  }
};

module.exports = { register, login };
