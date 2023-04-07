const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage();

const limits = 2e6; // 2 x 10^6

const fileFilter = (req, file, cb) => {
  const pattern = /jpg|png/i;
  const ext = path.extname(file.originalname);
  if (!pattern.test(ext)) return cb(null, false);
  cb(null, true);
};

const upload = multer({
  storage,
  limits,
  fileFilter,
}).array("images", 5); // tambahkan method "array" untuk multi-upload, dengan nama field "images" dan maksimal 5 gambar

module.exports = upload;
