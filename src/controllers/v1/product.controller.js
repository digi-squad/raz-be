const productModels = require("../../models/v1/product.model");

const { uploader } = require("../../utils/cloudinary");

const cloudUpload = async (req, res, next) => {
  try {
    const { files } = req;
    if (!files || !files.length)
      return res.status(200).json({ msg: "No File Uploaded" });
    const prefix = "product";
    const results = await Promise.all(
      files.map(async (file, i) => await uploader(file, prefix, i))
    );
    const success = results.filter((result) => result.secure_url);
    const errors = results.filter((result) => !result.secure_url);
    if (!success.length) throw { msg: "Upload Failed", errors };
    req.uploadResults = success; // simpan hasil upload pada object request untuk digunakan di middleware/controller berikutnya
    next(); // panggil fungsi next untuk melanjutkan ke middleware/controller selanjutnya
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
    next(error);
  }
};

const insertProduct = async (req, res) => {
  try {
    const { body, uploadResults } = req;
    const { id } = await productModels.insertProduct(body);

    await productModels.insertColorProduct(id, body);

    const images = uploadResults.map((result) => result.secure_url);

    for (let i = 0; i < images.length; i++) {
      await productModels.insertImageProduct(id, images[i]);
    }

    res.status(200).json({
      msg: "Insert Product Berhasil",
      id,
      images,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Internal Server Error",
    });
  }
};

const getProduct = async (req, res) => {
  try {
    const { query } = req;
    const { rows } = await productModels.getProduct(query);
    if (rows.length === 0) {
      res.status(404).json({
        msg: "Product not found",
      });
      return;
    }
    const meta = await productModels.getMetadata(query);
    res.status(200).json({
      data: rows,
      meta,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: "internal server error",
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { body, uploadResults } = req;

    const updateFields = {};
    if (body.name) updateFields.name = body.name;
    if (body.desc) updateFields.description = body.desc;
    if (body.sold) updateFields.sold = body.sold;
    if (body.stock) updateFields.stock = body.stock;
    if (body.price) updateFields.price = body.price;
    if (body.user) updateFields.user_id = body.user;
    if (body.category) updateFields.category_id = body.category;
    if (body.brand) updateFields.brand_id = body.brand;
    if (body.condition) updateFields.condition_id = body.condition;
    if (body.size) updateFields.size_id = body.size;

    for (let i = 0; i < uploadResults.length; i++) {
      const imageUrl = uploadResults[i].secure_url;
      await productModels
        .updateProductImage(id, imageUrl)
        .then(() => {
          res.status(200).json({
            msg: "Product berhasil di update",
          });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({
            msg: "Internal server error",
          });
        });
    }
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        msg: "Tidak ada data yang diperbarui",
      });
    }
    await productModels.updateProduct(id, updateFields);

    res.status(200).json({
      msg: "Update product berhasil",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      msg: "Internal server error",
    });
  }
};

const getProductDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await productModels.getProductDetail(id);
    res.status(200).json({
      rows: result.rows,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "internal server error",
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await productModels.deleteProduct(id);
    await productModels.deleteProductImage(id);
    await productModels.deleteProductColor(id);
    res.status(200).json({
      msg: "delete berhasil",
    });
  } catch (error) {
    res.status(500).json({
      msg: "internal server error",
    });
  }
};
module.exports = {
  insertProduct,
  cloudUpload,
  getProduct,
  updateProduct,
  getProductDetail,
  deleteProduct,
};