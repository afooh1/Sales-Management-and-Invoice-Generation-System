const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");
const Sale = require("../models/sale.model");

// Controller methods for PDF report generation
const pdfController = {
  // Generate customer list report
  generateCustomerReport: async (req, res) => {
    try {
      // Fetch all customers
      const customers = await Customer.find();

      // Create a PDF document
      const doc = new PDFDocument();
      const reportPath = path.join(
        __dirname,
        "../public/reports/customer_report.pdf"
      );

      // Ensure reports directory exists
      const reportsDir = path.join(__dirname, "../public/reports");
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      // Pipe the PDF to a file
      const stream = fs.createWriteStream(reportPath);
      doc.pipe(stream);

      // Add content to the PDF
      // Header
      doc.fontSize(20).text("TechTrove Electronics Shop", { align: "center" });
      doc.fontSize(16).text("Customer Report", { align: "center" });
      doc.moveDown();

      // Date and time
      doc
        .fontSize(10)
        .text(`Generated on: ${new Date().toLocaleString()}`, {
          align: "right",
        });
      doc.moveDown();

      // Customer table header
      doc.fontSize(12).font("Helvetica-Bold");
      doc.text("Customer ID", 50, 150);
      doc.text("Name", 150, 150);
      doc.text("Email", 250, 150);
      doc.text("Phone", 400, 150);
      doc.text("Loyalty Points", 480, 150);

      // Horizontal line
      doc.moveTo(50, 170).lineTo(550, 170).stroke();

      // Customer table content
      let y = 180;
      doc.fontSize(10).font("Helvetica");

      customers.forEach((customer) => {
        // Add a new page if needed
        if (y > 700) {
          doc.addPage();
          y = 50;

          // Add header to the new page
          doc.fontSize(12).font("Helvetica-Bold");
          doc.text("Customer ID", 50, y);
          doc.text("Name", 150, y);
          doc.text("Email", 250, y);
          doc.text("Phone", 400, y);
          doc.text("Loyalty Points", 480, y);

          // Horizontal line
          doc
            .moveTo(50, y + 20)
            .lineTo(550, y + 20)
            .stroke();

          y += 30;
          doc.fontSize(10).font("Helvetica");
        }

        doc.text(customer.customerID, 50, y);
        doc.text(customer.name, 150, y);
        doc.text(customer.email, 250, y);
        doc.text(customer.phone, 400, y);
        doc.text(customer.loyaltyPoints.toString(), 480, y);

        y += 20;
      });

      // Footer
      doc.fontSize(10).text("End of Report", { align: "center" });
      doc.moveDown();
      doc.text("Created by: [Student Names] - [Student Numbers]", {
        align: "center",
      });

      // Finalize PDF
      doc.end();

      // Wait for the PDF to be created
      stream.on("finish", () => {
        // Send the PDF file
        res.download(reportPath, "customer_report.pdf", (err) => {
          if (err) {
            res.status(500).render("error", {
              message: "Error downloading report",
              error: err,
            });
          }

          // Delete the file after download
          fs.unlinkSync(reportPath);
        });
      });
    } catch (error) {
      res.status(500).render("error", {
        message: "Error generating customer report",
        error,
      });
    }
  },

  // Generate product inventory report
  generateProductReport: async (req, res) => {
    try {
      // Fetch all products
      const products = await Product.find();

      // Create a PDF document
      const doc = new PDFDocument();
      const reportPath = path.join(
        __dirname,
        "../public/reports/product_report.pdf"
      );

      // Ensure reports directory exists
      const reportsDir = path.join(__dirname, "../public/reports");
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      // Pipe the PDF to a file
      const stream = fs.createWriteStream(reportPath);
      doc.pipe(stream);

      // Add content to the PDF
      // Header
      doc.fontSize(20).text("TechTrove Electronics Shop", { align: "center" });
      doc.fontSize(16).text("Product Inventory Report", { align: "center" });
      doc.moveDown();

      // Date and time
      doc
        .fontSize(10)
        .text(`Generated on: ${new Date().toLocaleString()}`, {
          align: "right",
        });
      doc.moveDown();

      // Product table header
      doc.fontSize(12).font("Helvetica-Bold");
      doc.text("Product ID", 50, 150);
      doc.text("Name", 130, 150);
      doc.text("Category", 280, 150);
      doc.text("Price", 370, 150);
      doc.text("Stock", 430, 150);
      doc.text("Status", 480, 150);

      // Horizontal line
      doc.moveTo(50, 170).lineTo(550, 170).stroke();

      // Product table content
      let y = 180;
      doc.fontSize(10).font("Helvetica");

      // Calculate total inventory value
      let totalValue = 0;
      let lowStockCount = 0;
      let outOfStockCount = 0;

      products.forEach((product) => {
        // Calculate inventory value
        totalValue += product.price * product.stock;

        // Count low and out of stock items
        if (product.stock === 0) {
          outOfStockCount++;
        } else if (product.stock < 10) {
          lowStockCount++;
        }

        // Add a new page if needed
        if (y > 700) {
          doc.addPage();
          y = 50;

          // Add header to the new page
          doc.fontSize(12).font("Helvetica-Bold");
          doc.text("Product ID", 50, y);
          doc.text("Name", 130, y);
          doc.text("Category", 280, y);
          doc.text("Price", 370, y);
          doc.text("Stock", 430, y);
          doc.text("Status", 480, y);

          // Horizontal line
          doc
            .moveTo(50, y + 20)
            .lineTo(550, y + 20)
            .stroke();

          y += 30;
          doc.fontSize(10).font("Helvetica");
        }

        doc.text(product.productID, 50, y);
        doc.text(product.name, 130, y);
        doc.text(product.category, 280, y);
        doc.text(`$${product.price.toFixed(2)}`, 370, y);
        doc.text(product.stock.toString(), 430, y);

        let status = "In Stock";
        if (product.stock === 0) {
          status = "Out of Stock";
        } else if (product.stock < 10) {
          status = "Low Stock";
        }

        doc.text(status, 480, y);

        y += 20;
      });

      // Add summary
      doc.moveDown(2);
      doc.fontSize(12).font("Helvetica-Bold").text("Inventory Summary", 50, y);
      y += 20;
      doc.fontSize(10).font("Helvetica");
      doc.text(`Total Products: ${products.length}`, 50, y);
      y += 15;
      doc.text(`Total Inventory Value: $${totalValue.toFixed(2)}`, 50, y);
      y += 15;
      doc.text(`Low Stock Items: ${lowStockCount}`, 50, y);
      y += 15;
      doc.text(`Out of Stock Items: ${outOfStockCount}`, 50, y);

      // Footer
      doc.fontSize(10).text("End of Report", { align: "center" });
      doc.moveDown();
      doc.text("Created by: [Student Names] - [Student Numbers]", {
        align: "center",
      });

      // Finalize PDF
      doc.end();

      // Wait for the PDF to be created
      stream.on("finish", () => {
        // Send the PDF file
        res.download(reportPath, "product_report.pdf", (err) => {
          if (err) {
            res.status(500).render("error", {
              message: "Error downloading report",
              error: err,
            });
          }

          // Delete the file after download
          fs.unlinkSync(reportPath);
        });
      });
    } catch (error) {
      res.status(500).render("error", {
        message: "Error generating product report",
        error,
      });
    }
  },

  // Generate sales invoice
  generateSalesInvoice: async (req, res) => {
    try {
      const saleId = req.params.id;

      // Fetch sale with customer and product details
      const sale = await Sale.findById(saleId)
        .populate("customer")
        .populate("items.product");

      if (!sale) {
        return res.status(404).render("error", {
          message: "Sale not found",
        });
      }

      // Create a PDF document
      const doc = new PDFDocument();
      const invoicePath = path.join(
        __dirname,
        `../public/reports/invoice_${saleId}.pdf`
      );

      // Ensure reports directory exists
      const reportsDir = path.join(__dirname, "../public/reports");
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      // Pipe the PDF to a file
      const stream = fs.createWriteStream(invoicePath);
      doc.pipe(stream);

      // Add content to the PDF
      // Header
      doc.fontSize(20).text("TechTrove Electronics Shop", { align: "center" });
      doc.fontSize(16).text("Sales Invoice", { align: "center" });
      doc.moveDown();

      // Invoice details
      doc.fontSize(12);
      doc.text(`Invoice #: ${sale.saleID}`, { align: "right" });
      doc.text(`Date: ${new Date(sale.saleDate).toLocaleDateString()}`, {
        align: "right",
      });
      doc.text(`Status: ${sale.status}`, { align: "right" });
      doc.moveDown();

      // Customer details
      doc.fontSize(12).font("Helvetica-Bold").text("Customer Information:");
      doc.fontSize(10).font("Helvetica");
      doc.text(`Name: ${sale.customer.name}`);
      doc.text(`Customer ID: ${sale.customer.customerID}`);
      doc.text(`Email: ${sale.customer.email}`);
      doc.text(`Phone: ${sale.customer.phone}`);
      doc.moveDown();

      // Items table
      doc.fontSize(12).font("Helvetica-Bold").text("Items Purchased:");
      doc.moveDown();

      // Table header
      const tableTop = doc.y;
      doc.fontSize(10).font("Helvetica-Bold");
      doc.text("Product", 50, tableTop);
      doc.text("Price", 300, tableTop);
      doc.text("Quantity", 380, tableTop);
      doc.text("Subtotal", 480, tableTop);

      // Horizontal line
      doc
        .moveTo(50, tableTop + 15)
        .lineTo(550, tableTop + 15)
        .stroke();

      // Table content
      let y = tableTop + 25;
      doc.fontSize(10).font("Helvetica");

      sale.items.forEach((item) => {
        doc.text(item.product.name, 50, y);
        doc.text(`$${item.price.toFixed(2)}`, 300, y);
        doc.text(item.quantity.toString(), 380, y);
        doc.text(`$${item.subtotal.toFixed(2)}`, 480, y);
        y += 20;
      });

      // Horizontal line
      doc.moveTo(50, y).lineTo(550, y).stroke();
      y += 15;

      // Total
      doc.fontSize(12).font("Helvetica-Bold");
      doc.text("Total Amount:", 380, y);
      doc.text(`$${sale.totalAmount.toFixed(2)}`, 480, y);

      // Payment method
      y += 20;
      doc.fontSize(10).font("Helvetica");
      doc.text(`Payment Method: ${sale.paymentMethod}`, 50, y);

      // Footer
      doc.moveDown(4);
      doc
        .fontSize(10)
        .text("Thank you for shopping with TechTrove Electronics Shop!", {
          align: "center",
        });
      doc.moveDown();
      doc
        .fontSize(8)
        .text(
          "* Returns and exchanges accepted within 30 days with original receipt.",
          { align: "center" }
        );
      doc.moveDown(2);
      doc.text("Created by: [Student Names] - [Student Numbers]", {
        align: "center",
      });

      // Finalize PDF
      doc.end();

      // Wait for the PDF to be created
      stream.on("finish", () => {
        // Send the PDF file
        res.download(invoicePath, `invoice_${sale.saleID}.pdf`, (err) => {
          if (err) {
            res.status(500).render("error", {
              message: "Error downloading invoice",
              error: err,
            });
          }

          // Delete the file after download
          fs.unlinkSync(invoicePath);
        });
      });
    } catch (error) {
      res.status(500).render("error", {
        message: "Error generating invoice",
        error,
      });
    }
  },
};

module.exports = pdfController;
