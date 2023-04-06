require("dotenv").config();
const express = require("express");
const cors = require("cors");
const masterRouter = require("./src/routes");
const morgan = require("morgan");

const app = express();
const port = process.env.APP_PORT || 3000;

app.use(cors());

// morgan for logging
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// routers
app.use(masterRouter);

app.listen(port, () => console.log(`App running on port: ${port}!`));
