const Sale = require("../models/sale.model");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

// Controller methods for sale operations
const saleController = {
  // Get all sales
  getAllSales: async (req, res) => {
    try {
      const sales = await Sale.find()
        .populate("customer")
        .populate("items.product")
        .sort({ saleDate: -1 });

      res.render("sales/list", {
        title: "Sales List - TechTrove",
        sales,
        page: "sales",
      });
    } catch (error) {
      res.status(500).render("error", {
        message: "Error fetching sales",
        error,
      });
    }
  },

  // Render add sale form
  renderAddSaleForm: async (req, res) => {
    try {
      // Fetch customers and products for dropdowns
      const customers = await Customer.find();
      const products = await Product.find({ stock: { $gt: 0 } });

      res.render("sales/add", {
        title: "New Sale - TechTrove",
        sale: {
          items: [{}],
          saleDate: new Date().toISOString().split("T")[0],
          paymentMethod: "Cash",
          status: "Completed",
        },
        customers,
        products,
        page: "sales",
      });
    } catch (error) {
      res.status(500).render("error", {
        message: "Error loading sale form",
        error,
      });
    }
  },

  // Add new sale
  addSale: async (req, res) => {
    try {
      const { saleID, customer, items, paymentMethod, status, saleDate } =
        req.body;

      // Parse items from form data
      let saleItems = [];
      let totalAmount = 0;

      if (Array.isArray(items.product)) {
        // Multiple items
        for (let i = 0; i < items.product.length; i++) {
          if (items.product[i]) {
            const product = await Product.findById(items.product[i]);
            const quantity = parseInt(items.quantity[i]);
            const price = product.price;
            const subtotal = price * quantity;

            saleItems.push({
              product: items.product[i],
              quantity,
              price,
              subtotal,
            });

            totalAmount += subtotal;

            // Update product stock
            await Product.findByIdAndUpdate(items.product[i], {
              $inc: { stock: -quantity },
            });
          }
        }
      } else {
        // Single item
        const product = await Product.findById(items.product);
        const quantity = parseInt(items.quantity);
        const price = product.price;
        const subtotal = price * quantity;

        saleItems.push({
          product: items.product,
          quantity,
          price,
          subtotal,
        });

        totalAmount += subtotal;

        // Update product stock
        await Product.findByIdAndUpdate(items.product, {
          $inc: { stock: -quantity },
        });
      }

      // Validate required fields
      if (!saleID || !customer || saleItems.length === 0) {
        const customers = await Customer.find();
        const products = await Product.find({ stock: { $gt: 0 } });

        return res.status(400).render("sales/add", {
          title: "New Sale - TechTrove",
          error:
            "Please fill in all required fields and add at least one product",
          sale: req.body,
          customers,
          products,
          page: "sales",
        });
      }

      // Check if sale with the same ID already exists
      const existingSale = await Sale.findOne({ saleID });
      if (existingSale) {
        const customers = await Customer.find();
        const products = await Product.find({ stock: { $gt: 0 } });

        return res.status(400).render("sales/add", {
          title: "New Sale - TechTrove",
          error: "A sale with this ID already exists",
          sale: req.body,
          customers,
          products,
          page: "sales",
        });
      }

      // Create new sale
      const newSale = new Sale({
        saleID,
        customer,
        items: saleItems,
        totalAmount,
        paymentMethod,
        status,
        saleDate: saleDate || new Date(),
      });

      await newSale.save();

      // Update customer loyalty points (add 10 points for every $100 spent)
      const loyaltyPointsEarned = Math.floor(totalAmount / 100) * 10;
      if (loyaltyPointsEarned > 0) {
        await Customer.findByIdAndUpdate(customer, {
          $inc: { loyaltyPoints: loyaltyPointsEarned },
        });
      }

      res.redirect("/sales");
    } catch (error) {
      res.status(500).render("error", {
        message: "Error creating sale",
        error,
      });
    }
  },

  // Render edit sale form
  renderEditSaleForm: async (req, res) => {
    try {
      const sale = await Sale.findById(req.params.id)
        .populate("customer")
        .populate("items.product");

      if (!sale) {
        return res.status(404).render("error", {
          message: "Sale not found",
        });
      }

      // Fetch customers and products for dropdowns
      const customers = await Customer.find();
      const products = await Product.find();

      // Format date for the form
      sale.formattedDate = new Date(sale.saleDate).toISOString().split("T")[0];

      res.render("sales/edit", {
        title: "Edit Sale - TechTrove",
        sale,
        customers,
        products,
        page: "sales",
      });
    } catch (error) {
      res.status(500).render("error", {
        message: "Error fetching sale",
        error,
      });
    }
  },

  // Update sale
  updateSale: async (req, res) => {
    try {
      const { paymentMethod, status, saleDate } = req.body;

      // Only allow updating payment method, status and date
      // Items cannot be modified to maintain inventory integrity

      const updatedSale = await Sale.findByIdAndUpdate(
        req.params.id,
        {
          paymentMethod,
          status,
          saleDate: saleDate || new Date(),
        },
        { new: true, runValidators: true }
      );

      if (!updatedSale) {
        return res.status(404).render("error", {
          message: "Sale not found",
        });
      }

      res.redirect("/sales");
    } catch (error) {
      res.status(500).render("error", {
        message: "Error updating sale",
        error,
      });
    }
  },

  // Delete sale
  deleteSale: async (req, res) => {
    try {
      const sale = await Sale.findById(req.params.id);

      if (!sale) {
        return res.status(404).json({
          success: false,
          message: "Sale not found",
        });
      }

      // Restore product stock
      for (const item of sale.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }

      // Remove loyalty points from customer
      const loyaltyPointsEarned = Math.floor(sale.totalAmount / 100) * 10;
      if (loyaltyPointsEarned > 0) {
        await Customer.findByIdAndUpdate(sale.customer, {
          $inc: { loyaltyPoints: -loyaltyPointsEarned },
        });
      }

      // Delete the sale
      await Sale.findByIdAndDelete(req.params.id);

      res.status(200).json({
        success: true,
        message: "Sale deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error deleting sale",
        error: error.message,
      });
    }
  },
};

module.exports = saleController;
