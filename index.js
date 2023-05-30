require("dotenv").config();
const express = require("express");
const cors = require("cors");
const masterRouter = require("./src/routes");
const morgan = require("morgan");
const mongoose = require("mongoose");
const allowCors = require("./src/middlewares/allowCors")

const app = express();
const port = process.env.APP_PORT || 3000;

app.use(cors());
app.use(allowCors());

// morgan for logging
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// routers
app.use(masterRouter);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@${process.env.MONGODB_HOST}/${process.env.MONGODB_NAME}?retryWrites=true&w=majority`
  )
  .then(() => {
    console.log("Mongo DB Connected");
    app.listen(port, () => {
      console.log(`Server is running at port ${port}`);
    });
  })
  .catch((err) => console.log(err));

module.exports = app;
// app.listen(port, () => console.log(`App running on port: ${port}!`));
