const authModel = require("../../models/v1/auth.model");

const register = async (req, res) => {
  const { email, password } = req.body;
  const regexEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
  if (email == undefined || email === "")
    return res.status(422).json({ msg: "EMAIL_IS_REQUIRED" });
  if (!email.match(regexEmail))
    return res.status(422).json({ msg: "INVALID_EMAIL" });
  if (password == undefined || parseInt(password.length) < 8)
    return res.status(422).json({ msg: "PASSWORD_ATLEAST_8_CHAR" });

  try {
    const checkEmail = await authModel.checkEmail(email);
    if (checkEmail.rows[0].count > 0)
      return res.status(409).json({ msg: "EMAIL_ALREADY_REGISTERED" });

    await authModel.createUser(email, password);
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

module.exports = { register };
