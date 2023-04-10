const db = require("../../configs/pg");
const trModel = require("../../models/v1/transactions.model");

const listTransactions = async (req, res) => {
  try {
    const { id } = req.authInfo;
    const result = await trModel.getAllTransactions(id);
    res.status(200).json({
      data: result.rows,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      msg: "INTERNAL_SERVER_ERROR",
    });
  }
};

const addTransaction = async (req, res) => {
  const client = await db.connect();
  try {
    const { id } = req.authInfo;
    const { payment } = req.body;
    client.query("BEGIN");
    const tr = await trModel.newTransaction(client, id, payment);
    const trId = tr.rows[0].id;

    // add all products
    await trModel.createDetailTransaction(client, req.body, trId);

    if (!req.body.products)
      return res.status(500).json({
        msg: "INTERNAL_SERVER_ERROR",
      });

    client.query("COMMIT");
    res.status(201).json({
      msg: "TRANSACTION_ADDED",
    });
  } catch (error) {
    client.query("ROLLBACK");
    console.log(error.message);
    res.status(500).json({
      msg: "INTERNAL_SERVER_ERROR",
    });
  }
};

module.exports = {
  addTransaction,
  listTransactions,
};
