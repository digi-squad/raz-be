const db = require("../../configs/pg");
const bcrypt = require("bcrypt");

const checkEmail = (email) => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT COUNT(*) as count FROM users where LOWER(email) = LOWER($1)";
    db.query(sql, [email], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

const checkRole = (roleId) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM user_roles where id = $1";
    db.query(sql, [roleId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

const createUser = (email, password, roleId) => {
  return new Promise(async (resolve, reject) => {
    const encryptedPass = await bcrypt.hash(password, 15);
    const sql = `INSERT INTO users (email, password, role_id) VALUES ($1, $2, $3)`;
    db.query(sql, [email, encryptedPass, roleId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

module.exports = {
  createUser,
  checkEmail,
  checkRole,
};
