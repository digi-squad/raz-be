const db = require("../../configs/pg");

const insertProduct = (body, user_id) => {
  return new Promise((resolve, reject) => {
    const sql =
      "insert into products (name,description,sold,stock,price,user_id,category_id,brand_id,condition_id,size_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) returning id";
    db.query(
      sql,
      [
        body.name,
        body.desc,
        body.sold,
        body.stock,
        body.price,
        user_id,
        body.category,
        body.brand,
        body.condition,
        body.size,
      ],
      (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result.rows[0]);
      }
    );
  });
};

const insertColorProduct = (id, body) => {
  return new Promise((resolve, reject) => {
    const sql =
      "insert into product_colors (product_id,name,hex_code) values ($1,$2,$3)";
    db.query(sql, [id, body.color, body.hex], (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
};

const insertImageProduct = (id, secure_url) => {
  return new Promise((resolve, reject) => {
    const sql = "insert into product_images (product_id,url) values ($1,$2)";
    db.query(sql, [id, secure_url], (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
};

const getProduct = (params) => {
  return new Promise((resolve, reject) => {
    let query = `SELECT p.id, p.name, p.description, p.stock, p.price, p.user_id,
    c.name AS category_name, b.name AS brand_name,
    d.name AS condition_name, s.name AS size_name,
    ARRAY_AGG(pc.name || ': ' || pc.hex_code) AS color,
    ARRAY_AGG(i.url) AS image_urls FROM products p
JOIN product_categories c ON p.category_id = c.id
JOIN product_brands b ON p.brand_id = b.id
JOIN product_conditions d ON p.condition_id = d.id
JOIN product_sizes s ON p.size_id = s.id
LEFT JOIN product_colors pc ON p.id = pc.product_id
LEFT JOIN product_images i ON p.id = i.product_id`;
    let queryParams = [];
    let queryWhere = [];
    if (params.search) {
      const searchQuery = `%${params.search}%`;
      queryWhere.push("p.name ILIKE $1");
      queryParams.push(searchQuery);
    }
    if (params.category) {
      const categoryQuery = parseInt(params.category);
      queryWhere.push("c.id = $" + (queryParams.length + 1));
      queryParams.push(categoryQuery);
    }
    if (params.sizes) {
      const sizesQuery = parseInt(params.sizes);
      queryWhere.push("s.id = $" + (queryParams.length + 1));
      queryParams.push(sizesQuery);
    }
    if (params.colors) {
      const colorsQuery = parseInt(params.colors);
      queryWhere.push("pc.product_id = $" + (queryParams.length + 1));
      queryParams.push(colorsQuery);
    }
    if (params.min_price && params.max_price) {
      const minPriceQuery = parseInt(params.min_price);
      const maxPriceQuery = parseInt(params.max_price);
      if (minPriceQuery >= maxPriceQuery) {
        reject("Min price should be lower than max price");
      }
      queryWhere.push(
        "p.price >= $" +
          (queryParams.length + 1) +
          " AND p.price <= $" +
          (queryParams.length + 2)
      );
      queryParams.push(minPriceQuery);
      queryParams.push(maxPriceQuery);
    }
    if (queryWhere.length > 0) {
      query += " WHERE " + queryWhere.join(" AND ");
    }
    query += `
GROUP BY p.id, p.user_id, c.name, b.name, d.name, s.name`;
    if (params.limit) {
      const limitQuery = parseInt(params.limit);
      query += ` LIMIT $${queryParams.length + 1}`;
      queryParams.push(limitQuery);
    }
    db.query(query, queryParams)
      .then((result) => resolve(result))
      .catch((error) => reject(error), console.log(query));
  });
};

const getMetadata = (params) => {
  return new Promise((resolve, reject) => {
    let query = `SELECT p.id, p.name, p.description, p.stock, p.price, p.user_id,
    c.name AS category_name, b.name AS brand_name,
    d.name AS condition_name, s.name AS size_name,
    ARRAY_AGG(pc.name || ': ' || pc.hex_code) AS color,
    ARRAY_AGG(i.url) AS image_urls FROM products p
    JOIN product_categories c ON p.category_id = c.id
    JOIN product_brands b ON p.brand_id = b.id
    JOIN product_conditions d ON p.condition_id = d.id
    JOIN product_sizes s ON p.size_id = s.id
    LEFT JOIN product_colors pc ON p.id = pc.product_id
    LEFT JOIN product_images i ON p.id = i.product_id`;
    let queryParams = [];
    let queryWhere = [];
    if (params.search) {
      const searchQuery = `%${params.search}%`;
      queryWhere.push("p.name ILIKE $1");
      queryParams.push(searchQuery);
    }
    if (params.category) {
      const categoryQuery = parseInt(params.category);
      queryWhere.push("c.id = $" + (queryParams.length + 1));
      queryParams.push(categoryQuery);
    }
    if (params.sizes) {
      const sizesQuery = parseInt(params.sizes);
      queryWhere.push("s.id = $" + (queryParams.length + 1));
      queryParams.push(sizesQuery);
    }
    if (params.colors) {
      const colorsQuery = parseInt(params.colors);
      queryWhere.push("pc.product_id = $" + (queryParams.length + 1));
      queryParams.push(colorsQuery);
    }
    if (params.min_price && params.max_price) {
      const minPriceQuery = parseInt(params.min_price);
      const maxPriceQuery = parseInt(params.max_price);
      if (minPriceQuery >= maxPriceQuery) {
        reject("Min price should be lower than max price");
      }
      queryWhere.push(
        "p.price >= $" +
          (queryParams.length + 1) +
          " AND p.price <= $" +
          (queryParams.length + 2)
      );
      queryParams.push(minPriceQuery);
      queryParams.push(maxPriceQuery);
    }
    if (queryWhere.length > 0) {
      query += " WHERE " + queryWhere.join(" AND ");
    }

    query += `
GROUP BY p.id, p.user_id, c.name, b.name, d.name, s.name`;
    if (params.limit) {
      const limitQuery = parseInt(params.limit);
      query += ` LIMIT $${queryParams.length + 1}`;
      queryParams.push(limitQuery);
    }

    if (params.page) {
      const pageQuery =
        (parseInt(params.page) - 1) * parseInt(params.limit) || 0;
      query += ` OFFSET $${queryParams.length + 1}`;
      queryParams.push(pageQuery);
    }

    query += `;`;

    db.query(query, queryParams, (error, result) => {
      if (error) {
        reject(error);
        return;
      }
      const totalData = parseInt(result.rows.length);
      const page = parseInt(params.page) || 1;
      const limit = parseInt(params.limit) || 10;
      const totalPage = Math.ceil(totalData / limit);
      let next = "";
      let prev = "";
      if (page > 1) {
        prev = `/products?page=${page - 1}&limit=${limit}`;
      }
      if (page < totalPage) {
        next = `/products?page=${page + 1}&limit=${limit}`;
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

const updateProduct = (id, body) => {
  return new Promise((resolve, reject) => {
    let updates = [];
    let values = [];
    Object.keys(body).forEach((key, index) => {
      if (body[key] !== undefined) {
        updates.push(`${key} = $${index + 1}`);
        values.push(body[key]);
      }
    });
    values.push(id);
    const sql = `UPDATE products SET ${updates.join(", ")} WHERE id = $${
      values.length
    }`;
    db.query(sql, values, (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result.rows);
    });
  });
};

const updateProductImage = (id, url) => {
  return new Promise((resolve, reject) => {
    const sql = "UPDATE product_images SET url = $1 WHERE product_id = $2";
    db.query(sql, [url, id], (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(result);
    });
  });
};

const getProductDetail = (id) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT
    products.id,
    products.name,
    products.description,
    products.stock,
    products.price,
    product_categories.name AS category_name,
    product_brands.name AS brand_name,
    product_conditions.name AS condition_name,
    product_sizes.name AS size_name,
    array_agg(DISTINCT product_colors.name || ': ' || product_colors.hex_code) AS color,
    array_agg(DISTINCT product_images.url) AS image_urls
  FROM
    products
    JOIN product_categories ON products.category_id = product_categories.id
    JOIN product_brands ON products.brand_id = product_brands.id
    JOIN product_conditions ON products.condition_id = product_conditions.id
    JOIN product_sizes ON products.size_id = product_sizes.id
    LEFT JOIN product_colors ON products.id = product_colors.product_id
    LEFT JOIN product_images ON products.id = product_images.product_id
  WHERE
    products.id = $1
  GROUP BY
    products.id,
    products.name,
    products.description,
    products.stock,
    products.price,
    product_categories.name,
    product_brands.name,
    product_conditions.name,
    product_sizes.name;`;
    db.query(sql, [id], (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(result);
    });
  });
};

const deleteProduct = (id) => {
  return new Promise((resolve, reject) => {
    const sql = "delete from products where id = $1";
    db.query(sql, [id], (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(result);
    });
  });
};

const deleteProductImage = (id) => {
  return new Promise((resolve, reject) => {
    const sql = "delete from product_images where product_id = $1";
    db.query(sql, [id], (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(result);
    });
  });
};

const deleteProductColor = (id) => {
  return new Promise((resolve, reject) => {
    const sql = "delete from product_colors where id = $1";
    db.query(sql, [id], (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(result);
    });
  });
};
module.exports = {
  insertProduct,
  insertImageProduct,
  insertColorProduct,
  getProduct,
  getMetadata,
  updateProduct,
  updateProductImage,
  getProductDetail,
  deleteProduct,
  deleteProductImage,
  deleteProductColor,
};
