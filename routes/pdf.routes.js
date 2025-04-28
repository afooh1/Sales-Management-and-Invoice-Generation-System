const express = require("express");
const router = express.Router();
const pdfController = require("../controllers/pdf.controller");

// GET /pdf/customers - Generate customer report
router.get("/customers", pdfController.generateCustomerReport);

// GET /pdf/products - Generate product report
router.get("/products", pdfController.generateProductReport);

// GET /pdf/invoice/:id - Generate sales invoice
router.get("/invoice/:id", pdfController.generateSalesInvoice);

module.exports = router;
