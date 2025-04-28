const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customer.controller");

// GET /customers - Display all customers
router.get("/", customerController.getAllCustomers);

// GET /customers/add - Display add customer form
router.get("/add", customerController.renderAddCustomerForm);

// POST /customers/add - Add a new customer
router.post("/add", customerController.addCustomer);

// GET /customers/edit/:id - Display edit customer form
router.get("/edit/:id", customerController.renderEditCustomerForm);

// POST /customers/edit/:id - Update a customer
router.post("/edit/:id", customerController.updateCustomer);

// DELETE /customers/:id - Delete a customer
router.delete("/:id", customerController.deleteCustomer);

module.exports = router;
