const { query } = require("express");
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
  return new Promise(async (resolve, reject) => {
    const { products } = body;
    let sql =
      "INSERT INTO transaction_product_size_color (transaction_id, product_id, size_id, color_id, quantity, subtotal) VALUES ";
    let values = [];
    for (let i = 0; i < products.length; i++) {
      const { product_id, size_id, color_id, qty } = products[i];
      const select = await client.query(
        `SELECT price FROM products WHERE id = $1;`,
        [product_id]
      );
      const subtotal = parseInt(select.rows[0].price) * parseInt(qty);
      if (values.length) sql += ", ";
      sql += `($${1 + 6 * i}, $${2 + 6 * i}, $${3 + 6 * i}, $${4 + 6 * i}, $${
        5 + 6 * i
      }, $${6 + 6 * i})`;
      values.push(transactionId, product_id, size_id, color_id, qty, subtotal);
    }

    client.query(sql, values, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

const getAllTransactions = (userId, q) => {
  return new Promise((resolve, reject) => {
    const limit = parseInt(q.limit) || 10;
    const page = parseInt(q.page) || 1;
    const offset = (page - 1) * limit;
    const values = [userId, limit, offset];

    let status = "";
    if (q.status) {
      status = " AND status_id = $4";
      values.push(parseInt(q.status));
    }

    let sql = `SELECT t.id AS transaction_id, t.created_at AS transaction_created_at,
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
    WHERE t.user_id = $1 ${status}
    GROUP BY t.id, t.created_at, st.placeholder
    ORDER BY t.created_at DESC`;

    sql += " LIMIT $2 OFFSET $3";
    db.query(sql, values, (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
};

const metaAllTransactions = (userId, q) => {
  return new Promise((resolve, reject) => {
    let sql = `SELECT COUNT(*) as total_data FROM transactions WHERE user_id = $1 `;
    const values = [userId];
    if (q.status) {
      sql += " AND status_id = $2";
      values.push(parseInt(q.status));
    }

    db.query(sql, values, (err, result) => {
      if (err) reject(err);

      const totalData = parseInt(result.rows[0].total_data);
      const page = parseInt(q.page) || 1;
      const limit = parseInt(q.limit) || 10;
      const totalPage = Math.ceil(totalData / limit);
      let urlq = {
        ...(q.status && { status: q.status }),
        ...(q.limit && { limit }),
      };

      let urlprev = {
        ...urlq,
        ...(q.page && { page: page - 1 }),
      };

      let urlnext = {
        ...urlq,
        ...(q.page && { page: page + 1 }),
      };

      let prevUrl = new URLSearchParams(urlprev);
      let nextUrl = new URLSearchParams(urlnext);

      let prev = "/transactions/?" + prevUrl;
      let next = "/transactions/?" + nextUrl;

      if (page < 2) prev = null;
      if (page >= totalPage) next = null;

      const meta = {
        totalData,
        next,
        prev,
        totalPage,
      };
      resolve(meta);
    });
  });
};

const getDetailTransaction = (trId) => {
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
    WHERE t.id = $1
    GROUP BY t.id, t.created_at, st.placeholder
    ORDER BY t.created_at DESC`;

    db.query(sql, [trId], (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
};

module.exports = {
  newTransaction,
  createDetailTransaction,
  metaAllTransactions,
  getAllTransactions,
  getDetailTransaction,
};
