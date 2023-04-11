const db = require("../../configs/pg");

const insertProduct = (client, body, user_id) => {
  return new Promise((resolve, reject) => {
    const sql =
      "insert into products (name,description,stock,price,user_id,category_id,brand_id,condition_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) returning id";
    client.query(
      sql,
      [
        body.name,
        body.desc,
        body.stock,
        body.price,
        user_id,
        body.category,
        body.brand,
        body.condition,
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

const insertColorProduct = (client, productId, colorId) => {
  return new Promise((resolve, reject) => {
    const sql =
      "insert into product_colors (product_id,color_id) values ($1,$2)";
    client.query(sql, [productId, colorId], (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
};

const insertSizeProduct = (client, productId, sizeId) => {
  return new Promise((resolve, reject) => {
    const sql = "insert into product_sizes (product_id,size_id) values ($1,$2)";
    client.query(sql, [productId, sizeId], (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
};

const insertImageProduct = (client, id, secure_url) => {
  return new Promise((resolve, reject) => {
    const sql = "insert into product_images (product_id,url) values ($1,$2)";
    client.query(sql, [id, secure_url], (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
};

const getProduct = (params) => {
  return new Promise((resolve, reject) => {
    let query = `SELECT p.id, p.name, p.description, p.stock, p.sold, p.price, p.user_id,
    c.name AS category_name, b.name AS brand_name,
    d.name AS condition_name, 
    json_agg(DISTINCT jsonb_build_object(
      'id', cl.id,
      'name', cl.name,
      'hex', cl.hex_code
    )) AS colors,
    json_agg(DISTINCT jsonb_build_object(
      'id', s.id,
      'name', s.name
    )) AS sizes,
    ARRAY_AGG(DISTINCT i.url) AS image_urls FROM products p
    JOIN product_categories c ON p.category_id = c.id
    JOIN product_brands b ON p.brand_id = b.id
    JOIN product_conditions d ON p.condition_id = d.id
    LEFT JOIN product_colors pcl ON p.id = pcl.product_id
    LEFT JOIN colors cl ON pcl.color_id = cl.id
    LEFT JOIN product_sizes ps ON p.id = ps.product_id
    LEFT JOIN sizes s ON ps.size_id = s.id
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
      queryWhere.push("ps.size_id = $" + (queryParams.length + 1));
      queryParams.push(sizesQuery);
    }
    if (params.brand) {
      const brandQuery = parseInt(params.brand);
      queryWhere.push("p.brand_id = $" + (queryParams.length + 1));
      queryParams.push(brandQuery);
    }
    if (params.colors) {
      const colorsQuery = parseInt(params.colors);
      queryWhere.push("pcl.color_id = $" + (queryParams.length + 1));
      queryParams.push(colorsQuery);
    }
    if (params.min_price && params.max_price) {
      const minPriceQuery = parseInt(params.min_price);
      const maxPriceQuery = parseInt(params.max_price);
      if (minPriceQuery >= maxPriceQuery) {
        reject("MIN_PRICE_MUST_LOWER_THAN_MAX_PRICE");
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
    query += ` GROUP BY p.id, p.user_id, c.name, b.name, d.name`;

    if (params.sort) {
      switch (params.sort) {
        case "expensive":
          query += ` ORDER BY p.price DESC`;
          break;

        case "cheap":
          query += ` ORDER BY p.price ASC`;
          break;

        case "oldest":
          query += ` ORDER BY p.created_at ASC`;
          break;

        case "bestselling":
          query += ` ORDER BY p.sold DESC`;
          break;

        default:
          query += ` ORDER BY p.created_at DESC`;
          break;
      }
    }

    if (params.limit) {
      const limitQuery = parseInt(params.limit);
      query += ` LIMIT $${queryParams.length + 1}`;
      queryParams.push(limitQuery);
    }
    db.query(query, queryParams)
      .then((result) => resolve(result))
      .catch(
        (error) => reject(error)
        // console.log(query)
      );
  });
};

const getMetadata = (params) => {
  return new Promise((resolve, reject) => {
    let query = `SELECT p.id, p.name, p.description, p.stock, p.price, p.user_id,
    c.name AS category_name, b.name AS brand_name,
    d.name AS condition_name, 
    array_agg(DISTINCT cl.name || ': ' || cl.hex_code) AS colors,
    array_agg(DISTINCT s.name) AS sizes,
    ARRAY_AGG(i.url) AS image_urls FROM products p
    JOIN product_categories c ON p.category_id = c.id
    JOIN product_brands b ON p.brand_id = b.id
    JOIN product_conditions d ON p.condition_id = d.id
    LEFT JOIN product_colors pcl ON p.id = pcl.product_id
    LEFT JOIN colors cl ON pcl.color_id = cl.id
    LEFT JOIN product_sizes ps ON p.id = ps.product_id
    LEFT JOIN sizes s ON ps.size_id = s.id
    LEFT JOIN product_images i ON p.id = i.product_id`;
    let queryParams = [];
    let queryWhere = [];
    let filters = {};
    if (params.search) {
      const searchQuery = `%${params.search}%`;
      queryWhere.push("p.name ILIKE $1");
      queryParams.push(searchQuery);
      filters = { ...filters, search: searchQuery };
    }
    if (params.category) {
      const categoryQuery = parseInt(params.category);
      queryWhere.push("c.id = $" + (queryParams.length + 1));
      queryParams.push(categoryQuery);
      filters = { ...filters, category: categoryQuery };
    }
    if (params.sizes) {
      const sizesQuery = parseInt(params.sizes);
      queryWhere.push("ps.size_id = $" + (queryParams.length + 1));
      queryParams.push(sizesQuery);
      filters = { ...filters, sizes: sizesQuery };
    }
    if (params.brand) {
      const brandQuery = parseInt(params.brand);
      queryWhere.push("p.brand_id = $" + (queryParams.length + 1));
      queryParams.push(brandQuery);
      filters = { ...filters, brand: brandQuery };
    }
    if (params.colors) {
      const colorsQuery = parseInt(params.colors);
      queryWhere.push("pcl.color_id = $" + (queryParams.length + 1));
      queryParams.push(colorsQuery);
      filters = { ...filters, color: colorsQuery };
    }
    if (params.min_price && params.max_price) {
      const minPriceQuery = parseInt(params.min_price);
      const maxPriceQuery = parseInt(params.max_price);
      if (minPriceQuery >= maxPriceQuery) {
        reject("MIN_PRICE_MUST_LOWER_THAN_MAX_PRICE");
      }
      queryWhere.push(
        "p.price >= $" +
          (queryParams.length + 1) +
          " AND p.price <= $" +
          (queryParams.length + 2)
      );
      queryParams.push(minPriceQuery);
      queryParams.push(maxPriceQuery);
      filters = {
        ...filters,
        min_price: minPriceQuery,
        max_price: maxPriceQuery,
      };
    }

    if (params.limit) {
      const limitQuery = parseInt(params.limit);
      filters = {
        ...filters,
        limit: limitQuery,
      };
    }

    if (queryWhere.length > 0) {
      query += " WHERE " + queryWhere.join(" AND ");
    }

    if (params.sort) {
      filters = {
        ...filters,
        sort: params.sort,
      };
    }

    query += ` GROUP BY p.id, p.user_id, c.name, b.name, d.name`;

    query += `;`;

    db.query(query, queryParams, (error, result) => {
      if (error) {
        reject(error.message);
        return;
      }
      const totalData = parseInt(result.rows.length);
      const page = parseInt(params.page) || 1;
      const limit = parseInt(params.limit) || 10;
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

      if (page > 1) {
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
    json_agg(DISTINCT jsonb_build_object(
      'id', colors.id,
      'name', colors.name,
      'hex', colors.hex_code
    )) AS colors,
    json_agg(DISTINCT jsonb_build_object(
      'id', sizes.id,
      'name', sizes.name
    )) AS sizes,
    array_agg(DISTINCT product_images.url) AS image_urls,
    users.store_name,
    users.store_desc
  FROM
    products
    JOIN product_categories ON products.category_id = product_categories.id
    JOIN product_brands ON products.brand_id = product_brands.id
    JOIN product_conditions ON products.condition_id = product_conditions.id
    JOIN users ON products.user_id = users.id
    LEFT JOIN product_colors ON products.id = product_colors.product_id
    LEFT JOIN colors ON product_colors.color_id = colors.id
    LEFT JOIN product_sizes ON products.id = product_sizes.product_id
    LEFT JOIN sizes ON product_sizes.size_id = sizes.id
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
    users.store_name,
    users.store_desc`;
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
  insertSizeProduct,
  getProduct,
  getMetadata,
  updateProduct,
  updateProductImage,
  getProductDetail,
  deleteProduct,
  deleteProductImage,
  deleteProductColor,
};
