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

const createUser = (email, password) => {
  return new Promise(async (resolve, reject) => {
    const encryptedPass = await bcrypt.hash(password, 15);
    const sql = `INSERT INTO users (email, password) VALUES ($1, $2)`;
    db.query(sql, [email, encryptedPass], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

module.exports = {
  createUser,
  checkEmail,
};
