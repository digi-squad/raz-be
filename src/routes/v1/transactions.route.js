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

transactionRoute.get(
  "/seller",
  auth.check,
  auth.seller,
  transactionController.listOrderSeller
);

transactionRoute.patch(
  "/seller",
  auth.check,
  auth.seller,
  transactionController.setDoneTransaction
);

transactionRoute.get(
  "/:id",
  auth.check,
  auth.customer,
  transactionController.detailTransaction
);

module.exports = transactionRoute;
