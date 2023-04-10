const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage();

const limits = 2e6;

const fileFilter = (req, file, cb) => {
  const pattern = /jpg|png|webp/i;
  const ext = path.extname(file.originalname);
  if (!pattern.test(ext)) {
    return cb(new Error("Only JPG, PNG, and WebP files are allowed"));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits,
  fileFilter,
});

// upload(req, res, function (err) {
//   if (err instanceof multer.MulterError) {
//     return res.status(422).json({ msg: "Invalid format type" });
//   } else if (err) {
//     console.log(err);
//     return res.status(500).json({ msg: err.message });
//   }
//   next();
// });

module.exports = upload;
