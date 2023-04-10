const db = require("../../configs/pg");

const newTransaction = (client, userId, paymentId) => {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO transactions (user_id, payment_id) VALUES ($1, $2) RETURNING id`;
    client.query(sql, [userId, paymentId], (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
};

const createDetailTransaction = (client, body, transactionId) => {
  return new Promise((resolve, reject) => {
    const { products } = body;
    let sql =
      "INSERT INTO transaction_product_size_color (transaction_id, product_id, size_id, color_id,quantity) VALUES ";
    let values = [];
    products.forEach((product, i) => {
      const { product_id, size_id, color_id, qty } = product;
      if (values.length) sql += ", ";
      sql += `($${1 + 5 * i}, $${2 + 5 * i}, $${3 + 5 * i}, $${4 + 5 * i}, $${
        5 + 5 * i
      })`;
      values.push(transactionId, product_id, size_id, color_id, qty);
    });
    client.query(sql, values, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

const getAllTransactions = (userId) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT t.id AS transaction_id, t.created_at AS transaction_created_at,
    st.placeholder as status,
    json_agg(json_build_object(
        'id', tp.id,
        'name', p.name,
        'color', c.name,
        'size', s.name,
        'quantity', tp.quantity,
        'price', p.price
    )) AS products
    FROM transactions t
    JOIN transaction_product_size_color tp ON t.id = tp.transaction_id
    JOIN products p ON tp.product_id = p.id
    JOIN colors c ON tp.color_id = c.id
    JOIN sizes s ON tp.size_id = s.id
    JOIN status st ON t.status_id = st.id
    WHERE t.user_id = $1
    GROUP BY t.id, t.created_at, st.placeholder
    ORDER BY t.created_at DESC`;
    db.query(sql, [userId], (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
};

module.exports = {
  newTransaction,
  createDetailTransaction,
  getAllTransactions,
};
