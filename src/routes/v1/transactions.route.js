const { Router } = require("express");
const transactionController = require("../../controllers/v1/transactions.controller");
const auth = require("../../middlewares/auth");

transactionRoute = Router();

transactionRoute.get(
  "/",
  auth.check,
  auth.customer,
  transactionController.listTransactions
);

transactionRoute.post(
  "/",
  auth.check,
  auth.customer,
  transactionController.addTransaction
);
module.exports = transactionRoute;
