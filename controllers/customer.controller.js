const Customer = require("../models/customer.model");

// Controller methods for customer operations
const customerController = {
  // Get all customers
  getAllCustomers: async (req, res) => {
    try {
      const customers = await Customer.find();
      res.render("customers/list", {
        title: "Customer List - TechTrove",
        customers,
        page: "customers",
      });
    } catch (error) {
      res.status(500).render("error", {
        message: "Error fetching customers",
        error,
      });
    }
  },

  // Render add customer form
  renderAddCustomerForm: (req, res) => {
    res.render("customers/add", {
      title: "Add New Customer - TechTrove",
      customer: {},
      page: "customers",
    });
  },

  // Add new customer
  addCustomer: async (req, res) => {
    try {
      const { customerID, name, email, phone, address, loyaltyPoints } =
        req.body;

      // Validate required fields
      if (!customerID || !name || !email || !phone || !address) {
        return res.status(400).render("customers/add", {
          title: "Add New Customer - TechTrove",
          error: "Please fill in all required fields",
          customer: req.body,
          page: "customers",
        });
      }

      // Check if customer with the same ID already exists
      const existingCustomer = await Customer.findOne({ customerID });
      if (existingCustomer) {
        return res.status(400).render("customers/add", {
          title: "Add New Customer - TechTrove",
          error: "A customer with this ID already exists",
          customer: req.body,
          page: "customers",
        });
      }

      // Create new customer
      const newCustomer = new Customer({
        customerID,
        name,
        email,
        phone,
        address,
        loyaltyPoints: loyaltyPoints || 0,
      });

      await newCustomer.save();

      res.redirect("/customers");
    } catch (error) {
      res.status(500).render("customers/add", {
        title: "Add New Customer - TechTrove",
        error: error.message,
        customer: req.body,
        page: "customers",
      });
    }
  },

  // Render edit customer form
  renderEditCustomerForm: async (req, res) => {
    try {
      const customer = await Customer.findById(req.params.id);

      if (!customer) {
        return res.status(404).render("error", {
          message: "Customer not found",
        });
      }

      res.render("customers/edit", {
        title: "Edit Customer - TechTrove",
        customer,
        page: "customers",
      });
    } catch (error) {
      res.status(500).render("error", {
        message: "Error fetching customer",
        error,
      });
    }
  },

  // Update customer
  updateCustomer: async (req, res) => {
    try {
      const { name, email, phone, address, loyaltyPoints } = req.body;

      // Validate required fields
      if (!name || !email || !phone || !address) {
        const customer = await Customer.findById(req.params.id);
        return res.status(400).render("customers/edit", {
          title: "Edit Customer - TechTrove",
          error: "Please fill in all required fields",
          customer: { ...customer._doc, ...req.body },
          page: "customers",
        });
      }

      // Update customer
      const updatedCustomer = await Customer.findByIdAndUpdate(
        req.params.id,
        {
          name,
          email,
          phone,
          address,
          loyaltyPoints: loyaltyPoints || 0,
        },
        { new: true, runValidators: true }
      );

      if (!updatedCustomer) {
        return res.status(404).render("error", {
          message: "Customer not found",
        });
      }

      res.redirect("/customers");
    } catch (error) {
      res.status(500).render("error", {
        message: "Error updating customer",
        error,
      });
    }
  },

  // Delete customer
  deleteCustomer: async (req, res) => {
    try {
      const deletedCustomer = await Customer.findByIdAndDelete(req.params.id);

      if (!deletedCustomer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Customer deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error deleting customer",
        error: error.message,
      });
    }
  },
};

module.exports = customerController;
