const { verify } = require("jsonwebtoken");
const db = require("../../configs/pg");
const bcrypt = require("bcrypt");

const checkEmail = (email) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM users where LOWER(email) = LOWER($1)";
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

const getUserByEmail = (email) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM users where LOWER(email) = LOWER($1)";
    db.query(sql, [email], (err, result) => {
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

const requestResetPass = (userId) => {
  return new Promise((resolve, reject) => {
    const sql = "INSERT INTO reset_password (user_id) VALUES ($1) RETURNING *";
    db.query(sql, [userId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

const deleteAllResetPass = (userId) => {
  return new Promise((resolve, reject) => {
    const sql = "DELETE FROM reset_password WHERE user_id = $1";
    db.query(sql, [userId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

const checkResetPass = (verifyId) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM reset_password WHERE verify = $1";
    db.query(sql, [verifyId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

const newPassword = (userId, password) => {
  return new Promise(async (resolve, reject) => {
    const encryptedPass = await bcrypt.hash(password, 15);

    const sql = "UPDATE users SET password = $1 WHERE id = $2";
    db.query(sql, [encryptedPass, userId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

module.exports = {
  createUser,
  checkEmail,
  checkRole,
  getUserByEmail,
  requestResetPass,
  deleteAllResetPass,
  checkResetPass,
  newPassword,
};
