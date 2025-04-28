const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");

// GET /products - Display all products
router.get("/", productController.getAllProducts);

// GET /products/add - Display add product form
router.get("/add", productController.renderAddProductForm);

// POST /products/add - Add a new product
router.post("/add", productController.addProduct);

// GET /products/edit/:id - Display edit product form
router.get("/edit/:id", productController.renderEditProductForm);

// POST /products/edit/:id - Update a product
router.post("/edit/:id", productController.updateProduct);

// DELETE /products/:id - Delete a product
router.delete("/:id", productController.deleteProduct);

module.exports = router;
