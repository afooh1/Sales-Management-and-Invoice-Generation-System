// Express application setup
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const pdfkit = require("pdfkit");
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");

// Import routes
const customerRoutes = require("./routes/customer.routes");
const productRoutes = require("./routes/product.routes");
const saleRoutes = require("./routes/sale.routes");
const pdfRoutes = require("./routes/pdf.routes");

// Import models
const Customer = require("./models/customer.model");
const Product = require("./models/product.model");
const Sale = require("./models/sale.model");

// Initialize express app
const app = express();
const PORT = process.env.PORT || 4000;

// Connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://mdijas555:Ironman21@cluster0.bmquj.mongodb.net/ComputerShop?retryWrites=true&w=majority&appName=Cluster0",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ Failed to connect to MongoDB:", err));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.use("/customers", customerRoutes);
app.use("/products", productRoutes);
app.use("/sales", saleRoutes);
app.use("/pdf", pdfRoutes);

// Home Route (Dashboard)
app.get("/", async (req, res) => {
  try {
    const customerCount = await Customer.countDocuments();
    const productCount = await Product.countDocuments();
    const allSales = await Sale.find().populate("customer"); // Adjust if your field is named 'shopper'

    const salesCount = allSales.length;
    const totalRevenue = allSales.reduce(
      (sum, sale) => sum + (sale.totalAmount || 0),
      0
    );
    const recentSales = allSales.slice(-5).reverse(); // Latest 5 sales

    const lowStockProducts = await Product.find({ stock: { $lt: 10 } });

    const stats = {
      customerCount,
      productCount,
      salesCount,
      totalRevenue,
    };

    res.render("index", {
      title: "TechTrove - Electronics Shop",
      page: "home",
      stats,
      recentSales,
      lowStockProducts,
    });
  } catch (err) {
    console.error("Error loading dashboard:", err);
    res.render("index", {
      title: "TechTrove - Electronics Shop",
      page: "home",
      stats: {
        customerCount: 0,
        productCount: 0,
        salesCount: 0,
        totalRevenue: 0,
      },
      recentSales: [],
      lowStockProducts: [],
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
