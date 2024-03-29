const authModel = require("../../models/v1/auth.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { jwtSecretKey } = require("../../configs/env");
const tokenModel = require("../../models/v1/token.model");
const nodemailer = require("../../utils/nodemailer");
const { emailHtml } = require("../../html/resetpass");

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
    if (checkEmail.rows.length > 0)
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
      role: result.rows[0].role_id,
      img: result.rows[0].img,
    };

    const jwtOptions = { expiresIn: 30 * 1000 };

    jwt.sign(payload, jwtSecretKey, jwtOptions, (err, token) => {
      if (err) throw err;

      let currentDate = new Date();
      let expirationDate = new Date(
        currentDate.getTime() + jwtOptions.expiresIn
      );

      tokenModel.store(
        {
          token,
          expired_at: expirationDate,
        },
        (err, result) => {
          if (err) throw err;
          console.log("TOKEN ADDED TO WHITELIST" + result);
        }
      );

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

const requestResetPass = async (req, res) => {
  const { email } = req.body;
  if (email == undefined || email === "")
    return res.status(422).json({ status: 422, msg: "EMAIL_IS_REQUIRED" });
  try {
    const result = await authModel.checkEmail(email);
    if (result.rows.length < 1)
      return res.status(404).json({
        status: 404,
        msg: "EMAIL_NOT_REGISTERED",
      });

    // delete all reset link for unvalidate
    await authModel.deleteAllResetPass(result.rows[0].id);

    // generate verify id for reset
    const generate = await authModel.requestResetPass(result.rows[0].id);

    console.log(`LINK: /resetpass/?verify=${generate.rows[0].verify}`);

    const mailData = {
      from: "Raz Shop <admin@digisquad-fw14.dev>", // sender address
      to: email, // list of receivers
      subject: "Password Reset at Raz Shop",
      text: `You have requested to reset your password.\n
              We cannot simply send you your old password. A unique link to reset your password has been generated for you. To reset your password, go to the following link and follow the instructions.\n
              https://raz-fe.vercel.app/resetpass/?verify=${generate.rows[0].verify}
      `,
      html: emailHtml(generate.rows[0].verify),
    };

    nodemailer.transporter.sendMail(mailData, (err, info) => {
      if (err) {
        return console.log(err);
      }
      console.log(info);
    });
    console.log(`LINK: /resetpass/?verify=${generate.rows[0].verify}`);
    res.status(201).json({
      status: 201,
      msg: "RESET_LINK_HAS_BEEN_CREATED",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      status: 500,
      msg: "INTERNAL_SERVER_ERROR",
    });
  }
};

const checkResetPass = async (req, res) => {
  const { verify } = req.query;
  if (verify == undefined || verify === "")
    return res.status(404).json({ msg: "VERIFY_REQUIRED" });

  try {
    const result = await authModel.checkResetPass(verify);
    if (result.rows.length < 1)
      return res.status(404).json({
        msg: "RESET_PASSWORD_NOT_FOUND",
      });

    const expired_time = new Date(result.rows[0].expired_at);
    const now = new Date();
    console.log(`${expired_time}\n${now}`);
    if (now > expired_time)
      return res.status(403).json({
        msg: "LINK_EXPIRED",
      });

    res.status(200).json({
      msg: "RESET_PASSWORD_FOUND",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      msg: "INTERNAL_SERVER_ERROR",
    });
  }
};

const resetPass = async (req, res) => {
  const { password } = req.body;

  const { verify } = req.query;
  if (verify == undefined || verify === "")
    return res.status(404).json({ msg: "VERIFY_REQUIRED" });
  if (password == undefined || parseInt(password.length) < 8)
    return res.status(422).json({ msg: "PASSWORD_ATLEAST_8_CHAR" });

  try {
    const result = await authModel.checkResetPass(verify);
    if (result.rows.length < 1)
      return res.status(404).json({
        msg: "RESET_PASSWORD_NOT_FOUND",
      });

    const expired_time = new Date(result.rows[0].expired_at);
    const now = new Date();
    console.log(`${expired_time}\n${now}`);
    if (now > expired_time)
      return res.status(403).json({
        msg: "LINK_EXPIRED",
      });

    // unvalidate all verify from client user
    await authModel.deleteAllResetPass(result.rows[0].user_id);

    // new password
    await authModel.newPassword(result.rows[0].user_id, password);

    res.status(200).json({
      msg: "SUCCESS_RESET_PASSWORD",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      msg: "INTERNAL_SERVER_ERROR",
    });
  }
};

const logout = async (req, res) => {
  try {
    const token = req.header("Authorization").split(" ")[1];
    const removeToken = await tokenModel.destroy(token);
    if (!removeToken) {
      throw new Error("Token not valid");
    }
    console.log("token invalidate success");
    res.status(200).json({
      msg: "LOGOUT_SUCCESS",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Internal Server Error",
    });
  }
};

module.exports = {
  register,
  login,
  requestResetPass,
  checkResetPass,
  resetPass,
  logout,
};
