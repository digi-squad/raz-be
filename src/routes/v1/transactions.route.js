const { Router } = require("express");
const transactionController = require("../../controllers/v1/transactions.controller");

transactionRoute = Router();
transactionRoute.post("/", transactionController.addTransaction);
module.exports = transactionRoute;
