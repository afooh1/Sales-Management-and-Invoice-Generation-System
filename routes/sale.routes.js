const express = require("express");
const router = express.Router();
const saleController = require("../controllers/sale.controller");

// GET /sales - Display all sales
router.get("/", saleController.getAllSales);

// GET /sales/add - Display add sale form
router.get("/add", saleController.renderAddSaleForm);

// POST /sales/add - Add a new sale
router.post("/add", saleController.addSale);

// GET /sales/edit/:id - Display edit sale form
router.get("/edit/:id", saleController.renderEditSaleForm);

// POST /sales/edit/:id - Update a sale
router.post("/edit/:id", saleController.updateSale);

// DELETE /sales/:id - Delete a sale
router.delete("/:id", saleController.deleteSale);

module.exports = router;
