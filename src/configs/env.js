module.exports = {
  host: process.env.DB_HOST,
  db: process.env.DB_NAME,
  dbport: process.env.DB_PORT,
  user: process.env.DB_USER,
  pwd: process.env.DB_PASS,
  jwtSecretKey: process.env.JWT_SECRET_KEY,
  cloudinaryName: process.env.CLOUD_NAME,
  cloudinaryKey: process.env.CLOUD_KEY,
  cloudinarySecret: process.env.CLOUD_SECRET,
};
