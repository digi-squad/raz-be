const nodemailer = require("nodemailer");
const { NODEMAILER_HOST, NODEMAILER_PORT, NODEMAILER_USER, NODEMAILER_PASS } =
  process.env;

const transporter = nodemailer.createTransport({
  host: NODEMAILER_HOST,
  port: NODEMAILER_PORT,
  secure: true, // true for 465, false for other ports
  auth: {
    user: NODEMAILER_USER, // generated ethereal user
    pass: NODEMAILER_PASS, // generated ethereal password
  },
});

module.exports = { transporter };
