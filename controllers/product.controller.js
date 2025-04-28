const Product = require("../models/product.model");

// Controller methods for product operations
const productController = {
  // Get all products
  getAllProducts: async (req, res) => {
    try {
      const products = await Product.find();
      res.render("products/list", {
        title: "Product List - TechTrove",
        products,
        page: "products",
      });
    } catch (error) {
      res.status(500).render("error", {
        message: "Error fetching products",
        error,
      });
    }
  },

  // Render add product form
  renderAddProductForm: (req, res) => {
    res.render("products/add", {
      title: "Add New Product - TechTrove",
      product: {},
      page: "products",
    });
  },

  // Add new product
  addProduct: async (req, res) => {
    try {
      const {
        productID,
        name,
        brand,
        model,
        category,
        processor,
        ram,
        storage,
        price,
        stock,
        description,
      } = req.body;

      // Validate required fields
      if (!productID || !name || !brand || !model || !category || !price) {
        return res.status(400).render("products/add", {
          title: "Add New Product - TechTrove",
          error: "Please fill in all required fields",
          product: req.body,
          page: "products",
        });
      }

      // Check if product with the same ID already exists
      const existingProduct = await Product.findOne({ productID });
      if (existingProduct) {
        return res.status(400).render("products/add", {
          title: "Add New Product - TechTrove",
          error: "A product with this ID already exists",
          product: req.body,
          page: "products",
        });
      }

      // Create new product
      const newProduct = new Product({
        productID,
        name,
        brand,
        model,
        category,
        processor: processor || "N/A",
        ram: ram || "N/A",
        storage: storage || "N/A",
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
        description,
      });

      await newProduct.save();

      res.redirect("/products");
    } catch (error) {
      res.status(500).render("products/add", {
        title: "Add New Product - TechTrove",
        error: error.message,
        product: req.body,
        page: "products",
      });
    }
  },

  // Render edit product form
  renderEditProductForm: async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).render("error", {
          message: "Product not found",
        });
      }

      res.render("products/edit", {
        title: "Edit Product - TechTrove",
        product,
        page: "products",
      });
    } catch (error) {
      res.status(500).render("error", {
        message: "Error fetching product",
        error,
      });
    }
  },

  // Update product
  updateProduct: async (req, res) => {
    try {
      const {
        name,
        brand,
        model,
        category,
        processor,
        ram,
        storage,
        price,
        stock,
        description,
      } = req.body;

      // Validate required fields
      if (!name || !brand || !model || !category || !price) {
        const product = await Product.findById(req.params.id);
        return res.status(400).render("products/edit", {
          title: "Edit Product - TechTrove",
          error: "Please fill in all required fields",
          product: { ...product._doc, ...req.body },
          page: "products",
        });
      }

      // Update product
      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
          name,
          brand,
          model,
          category,
          processor: processor || "N/A",
          ram: ram || "N/A",
          storage: storage || "N/A",
          price: parseFloat(price),
          stock: parseInt(stock) || 0,
          description,
        },
        { new: true, runValidators: true }
      );

      if (!updatedProduct) {
        return res.status(404).render("error", {
          message: "Product not found",
        });
      }

      res.redirect("/products");
    } catch (error) {
      res.status(500).render("error", {
        message: "Error updating product",
        error,
      });
    }
  },

  // Delete product
  deleteProduct: async (req, res) => {
    try {
      const deletedProduct = await Product.findByIdAndDelete(req.params.id);

      if (!deletedProduct) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error deleting product",
        error: error.message,
      });
    }
  },
};

module.exports = productController;
