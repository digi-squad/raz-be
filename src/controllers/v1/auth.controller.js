const authModel = require("../../models/v1/auth.model");

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

module.exports = { register };
