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

const getOrderSeller = (seller_id, query) => {
  return new Promise((resolve, reject) => {
    let values = [];
    let queryWhere = [];

    // filter seller
    const searchQuery = seller_id;
    queryWhere.push("p.user_id = $1");
    values.push(searchQuery);

    if (query.status_id) {
      const statusQuery = parseInt(query.status_id);
      queryWhere.push("t.status_id = $" + (values.length + 1));
      values.push(statusQuery);
    }

    let sql = `SELECT 
    t.id AS transaction_id, 
    t.created_at AS transaction_created_at,
    st.placeholder as status,
    st.id as status_id,
    sum(tp.subtotal) AS grandtotal,
    json_agg(json_build_object(
        'id', tp.id,
        'name', p.name,
        'color', c.name,
        'size', s.name,
        'quantity', tp.quantity,
        'subtotal', tp.subtotal
    )) AS products
    FROM 
      transactions t
    JOIN 
      transaction_product_size_color tp ON t.id = tp.transaction_id
    JOIN 
      products p ON tp.product_id = p.id
    JOIN 
      colors c ON tp.color_id = c.id
    JOIN 
      sizes s ON tp.size_id = s.id
    JOIN 
      status st ON t.status_id = st.id`;

    if (queryWhere.length > 0) {
      sql += " WHERE " + queryWhere.join(" AND ");
    }

    sql += `
    GROUP BY 
      t.id, 
      t.created_at,
      st.placeholder,
      st.id`;
    if (query.sort) {
      sql += " ORDER BY ";
      switch (query.sort) {
        case "newest":
          sql += "t.created_at DESC";
          break;
        case "oldest":
          sql += "t.created_at ASC";
          break;

        default:
          sql += "t.created_at DESC";
          break;
      }
    }

    // pagination

    let limitQuery = parseInt(query.limit);
    if (isNaN(limitQuery)) limitQuery = 10;
    if (limitQuery > 50) limitQuery = 50;

    sql += ` LIMIT $${values.length + 1}`;
    values.push(limitQuery);

    let pageQuery = parseInt(query.page);
    if (isNaN(pageQuery)) {
      pageQuery = "1";
    }
    const offset = (pageQuery - 1) * limitQuery;
    sql += ` OFFSET $${values.length + 1}`;
    values.push(offset);

    // console.log(sql);
    db.query(sql, values, (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
};

const getMetaOrderSeller = (seller_id, query) => {
  return new Promise((resolve, reject) => {
    let values = [];
    let queryWhere = [];
    let filters = {};

    // filter seller
    const searchQuery = seller_id;
    queryWhere.push("p.user_id = $1");
    values.push(searchQuery);

    if (query.status_id) {
      const statusQuery = parseInt(query.status_id);
      queryWhere.push("t.status_id = $" + (values.length + 1));
      values.push(statusQuery);
      filters = { ...filters, status_id: statusQuery };
    }

    let sql = `SELECT 
      COUNT(*) as total_data
    FROM 
      transactions t
    JOIN 
      transaction_product_size_color tp ON t.id = tp.transaction_id
    JOIN 
      products p ON tp.product_id = p.id
    JOIN 
      colors c ON tp.color_id = c.id
    JOIN 
      sizes s ON tp.size_id = s.id
    JOIN 
      status st ON t.status_id = st.id`;

    if (queryWhere.length > 0) {
      sql += " WHERE " + queryWhere.join(" AND ");
    }

    sql += `
    GROUP BY 
      t.id, 
      t.created_at,
      st.placeholder,
      st.id`;
    if (query.sort) {
      sql += " ORDER BY ";
      switch (query.sort) {
        case "newest":
          sql += "t.created_at DESC";
          filters = { ...filters, sort: "newest" };
          break;
        case "oldest":
          sql += "t.created_at ASC";
          filters = { ...filters, sort: "oldest" };
          break;

        default:
          sql += "t.created_at DESC";
          break;
      }
    }

    // console.log(sql);
    db.query(sql, values, (err, result) => {
      if (err) reject(err);
      const totalData = parseInt(result.rows.length);
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 10;
      const totalPage = Math.ceil(totalData / limit);
      let next = null;
      let prev = null;

      let urlprev = {
        ...filters,
        ...{ page: page - 1 },
      };

      let urlnext = {
        ...filters,
        ...{ page: page + 1 },
      };

      let prevUrl = new URLSearchParams(urlprev);
      let nextUrl = new URLSearchParams(urlnext);

      if (page > 1 && totalData > 1) {
        prev = `/products?${prevUrl}`;
      }
      if (page < totalPage) {
        next = `/products?${nextUrl}`;
      }
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

    let sql = `
    SELECT 
      t.id AS transaction_id, 
      t.created_at AS transaction_created_at,
      st.placeholder as status,
      sum(tp.subtotal) AS grandtotal,
      json_agg(json_build_object(
          'id', tp.id,
          'name', p.name,
          'color', c.name,
          'size', s.name,
          'quantity', tp.quantity,
          'subtotal', tp.subtotal
      )) AS products
    FROM 
      transactions t
    JOIN 
      transaction_product_size_color tp ON t.id = tp.transaction_id
    JOIN 
      products p ON tp.product_id = p.id
    JOIN 
      colors c ON tp.color_id = c.id
    JOIN 
      sizes s ON tp.size_id = s.id
    JOIN 
      status st ON t.status_id = st.id
    WHERE 
      t.user_id = $1 ${status}
    GROUP BY 
      t.id, 
      t.created_at, 
      st.placeholder
    ORDER BY 
      t.created_at DESC`;

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
    sum(tp.subtotal) AS grandtotal,
    json_agg(json_build_object(
        'id', tp.id,
        'name', p.name,
        'color', c.name,
        'size', s.name,
        'quantity', tp.quantity,
        'subtotal', tp.subtotal
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

const setDoneTransactionById = (userId, transactionId) => {
  return new Promise((resolve, reject) => {
    const sql = `
    UPDATE transactions
    SET status_id = 3
    WHERE id = $2
      AND EXISTS (
        SELECT 1
        FROM transaction_product_size_color AS tpsc
        INNER JOIN products ON products.id = tpsc.product_id
        WHERE tpsc.transaction_id = transactions.id
          AND products.user_id = $1
      )
    RETURNING *`;
    db.query(sql, [userId, transactionId], (err, result) => {
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
  getOrderSeller,
  getMetaOrderSeller,
  setDoneTransactionById,
};
