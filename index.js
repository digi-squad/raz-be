require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.APP_PORT || 3000;

app.use(cors());

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.listen(port, () => console.log(`App running on port: ${port}!`));
