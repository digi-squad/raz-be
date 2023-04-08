const db = require("../../configs/pg");

const getProfile = (userId, role) => {
  return new Promise((resolve, reject) => {
    let store = "";
    if (role === 2) {
      store = ",store_name, store_desc";
    }
    const sql = `SELECT id, email, img ${store} FROM users WHERE id = $1`;
    db.query(sql, [userId], (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
};

const editProfile = (userId, body) => {
  return new Promise((resolve, reject) => {
    const { email, name, img, store_name, store_desc, gender } = body;
    let input;
    let count = 0;
    const values = [];
    if (email) {
      count += 1;
      input += `email = ${count}`;
      values.push(email);
    }

    if (name) {
      count += 1;
      input += (count > 0 ? ", " : "") + `name = ${count}`;
      values.push(name);
    }

    if (img) {
      count += 1;
      input += (count > 0 ? ", " : "") + `img = ${count}`;
      values.push(img);
    }

    if (store_name) {
      count += 1;
      input += (count > 0 ? ", " : "") + `store_name = ${count}`;
      values.push(store_name);
    }

    if (store_desc) {
      count += 1;
      input += (count > 0 ? ", " : "") + `store_desc = ${count}`;
      values.push(store_desc);
    }

    if (gender) {
      count += 1;
      input += (count > 0 ? ", " : "") + `gender_id = ${count}`;
      values.push(gender);
    }

    values.push(userId);

    const sql = `UPDATE users SET ${input} WHERE id = ${count + 1}`;
    db.query(sql, values, (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
};

module.exports = { getProfile, editProfile };
