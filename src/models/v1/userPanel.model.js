const db = require("../../configs/pg");

const getProfile = (userId, role) => {
  return new Promise((resolve, reject) => {
    let store = "";
    if (role === 2) {
      store = ",store_name, store_desc";
    }
    const sql = `SELECT id, email, name, img ${store} FROM users WHERE id = $1`;
    db.query(sql, [userId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

const editProfile = (userId, body, dataImage) => {
  return new Promise((resolve, reject) => {
    const { email, name, store_name, store_desc, gender } = body;
    let input = "";
    let count = 0;
    const values = [];
    let url = "";
    if (dataImage) {
      url = dataImage.secure_url;
    }

    if (email) {
      count += 1;
      input += `email = ${count}`;
      values.push(email);
    }

    if (name) {
      count += 1;
      input += (count > 1 ? ", " : "") + `name = $${count}`;
      values.push(name);
    }

    if (url && url !== "") {
      count += 1;
      input += (count > 1 ? ", " : "") + `img = $${count}`;
      values.push(url);
    }

    if (store_name) {
      count += 1;
      input += (count > 1 ? ", " : "") + `store_name = $${count}`;
      values.push(store_name);
    }

    if (store_desc) {
      count += 1;
      input += (count > 1 ? ", " : "") + `store_desc = $${count}`;
      values.push(store_desc);
    }

    if (gender) {
      count += 1;
      input += (count > 1 ? ", " : "") + `gender_id = $${count}`;
      values.push(gender);
    }

    values.push(userId);

    const sql = `UPDATE users SET ${input} WHERE id = $${count + 1}`;

    db.query(sql, values, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

const getWishlists = (userId) => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT uw.product_id, p.stock, p.price FROM user_wishlists uw JOIN products p ON p.id = uw.product_id WHERE user_id = $1";
    db.query(sql, [userId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};
const addWishlist = (userId, productId) => {
  return new Promise((resolve, reject) => {
    const sql = "INSERT INTO products (product_id, user_id) VALUES ($1, $2)";
    db.query(sql, [productId, userId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

module.exports = { getProfile, editProfile, getWishlists, addWishlist };
