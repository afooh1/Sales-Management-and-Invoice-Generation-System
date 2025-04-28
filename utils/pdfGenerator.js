const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// PDF Generator Utility Class
class PDFGenerator {
  // Constructor
  constructor() {
    // Company Info
    this.companyInfo = {
      name: "TechTrove Electronics Shop",
      address: "123 Tech Avenue, Digital City",
      phone: "(123) 456-7890",
      email: "info@techtrove.com",
      website: "www.techtrove.com",
    };

    // Logo path
    this.logoPath = path.join(__dirname, "../public/images/logo.png");
  }

  // Generate Customer Report
  async generateCustomerReport(customers) {
    return new Promise((resolve, reject) => {
      try {
        // Create a PDF document
        const doc = new PDFDocument({ margin: 50 });

        // Output file path
        const outputPath = path.join(
          __dirname,
          "../public/reports",
          `customer_report_${Date.now()}.pdf`
        );

        // Create directory if it doesn't exist
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        // Pipe output to file
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        // Add header
        this._addHeader(doc, "Customer Report");

        // Add content
        doc
          .fontSize(10)
          .text(`Report Date: ${new Date().toLocaleString()}`, {
            align: "right",
          });
        doc.moveDown(2);

        // Create table
        const tableTop = doc.y;
        const tableHeaders = [
          "Customer ID",
          "Name",
          "Email",
          "Phone",
          "Loyalty Points",
        ];
        const columnWidths = [80, 120, 150, 100, 70];

        // Draw table headers
        let xPos = 50;
        doc.font("Helvetica-Bold").fontSize(10);
        tableHeaders.forEach((header, i) => {
          doc.text(header, xPos, tableTop, {
            width: columnWidths[i],
            align: "left",
          });
          xPos += columnWidths[i];
        });

        // Draw horizontal line
        doc.moveDown(0.5);
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);

        // Draw table rows
        doc.font("Helvetica").fontSize(9);
        customers.forEach((customer, i) => {
          // Check if we need a new page
          if (doc.y > 700) {
            doc.addPage();

            // Redraw headers
            xPos = 50;
            doc.font("Helvetica-Bold").fontSize(10);
            tableHeaders.forEach((header, i) => {
              doc.text(header, xPos, 50, {
                width: columnWidths[i],
                align: "left",
              });
              xPos += columnWidths[i];
            });

            // Draw horizontal line
            doc.moveTo(50, 70).lineTo(550, 70).stroke();
            doc.font("Helvetica").fontSize(9);
            doc.y = 80;
          }

          // Draw row with alternating background
          if (i % 2 === 1) {
            doc.rect(50, doc.y, 500, 20).fill("#f5f5f5");
            doc.fillColor("black");
          }

          // Draw data
          xPos = 50;
          const rowData = [
            customer.customerID,
            customer.name,
            customer.email,
            customer.phone,
            customer.loyaltyPoints.toString(),
          ];

          const currentY = doc.y;
          rowData.forEach((data, i) => {
            doc.text(data, xPos, currentY + 5, {
              width: columnWidths[i],
              align: "left",
            });
            xPos += columnWidths[i];
          });

          doc.moveDown();
        });

        // Add footer
        this._addFooter(doc);

        // Finalize the PDF
        doc.end();

        // When the stream is done, resolve with the path
        stream.on("finish", () => {
          resolve(outputPath);
        });

        stream.on("error", (error) => {
          reject(error);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  // Generate Product Report
  async generateProductReport(products) {
    return new Promise((resolve, reject) => {
      try {
        // Create a PDF document
        const doc = new PDFDocument({ margin: 50 });

        // Output file path
        const outputPath = path.join(
          __dirname,
          "../public/reports",
          `product_report_${Date.now()}.pdf`
        );

        // Create directory if it doesn't exist
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        // Pipe output to file
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        // Add header
        this._addHeader(doc, "Product Inventory Report");

        // Add content
        doc
          .fontSize(10)
          .text(`Report Date: ${new Date().toLocaleString()}`, {
            align: "right",
          });
        doc.moveDown(2);

        // Create table
        const tableTop = doc.y;
        const tableHeaders = [
          "Product ID",
          "Name",
          "Category",
          "Price",
          "Stock",
          "Status",
        ];
        const columnWidths = [80, 150, 80, 60, 40, 80];

        // Draw table headers
        let xPos = 50;
        doc.font("Helvetica-Bold").fontSize(10);
        tableHeaders.forEach((header, i) => {
          doc.text(header, xPos, tableTop, {
            width: columnWidths[i],
            align: "left",
          });
          xPos += columnWidths[i];
        });

        // Draw horizontal line
        doc.moveDown(0.5);
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);

        // Calculate inventory stats
        let totalValue = 0;
        let lowStockCount = 0;
        let outOfStockCount = 0;

        // Draw table rows
        doc.font("Helvetica").fontSize(9);
        products.forEach((product, i) => {
          // Calculate stats
          totalValue += product.price * product.stock;
          if (product.stock === 0) outOfStockCount++;
          else if (product.stock < 10) lowStockCount++;

          // Check if we need a new page
          if (doc.y > 700) {
            doc.addPage();

            // Redraw headers
            xPos = 50;
            doc.font("Helvetica-Bold").fontSize(10);
            tableHeaders.forEach((header, i) => {
              doc.text(header, xPos, 50, {
                width: columnWidths[i],
                align: "left",
              });
              xPos += columnWidths[i];
            });

            // Draw horizontal line
            doc.moveTo(50, 70).lineTo(550, 70).stroke();
            doc.font("Helvetica").fontSize(9);
            doc.y = 80;
          }

          // Draw row with alternating background
          if (i % 2 === 1) {
            doc.rect(50, doc.y, 500, 20).fill("#f5f5f5");
            doc.fillColor("black");
          }

          // Determine status
          let status = "In Stock";
          if (product.stock === 0) status = "Out of Stock";
          else if (product.stock < 10) status = "Low Stock";

          // Draw data
          xPos = 50;
          const rowData = [
            product.productID,
            product.name,
            product.category,
            `$${product.price.toFixed(2)}`,
            product.stock.toString(),
            status,
          ];

          const currentY = doc.y;
          rowData.forEach((data, i) => {
            doc.text(data, xPos, currentY + 5, {
              width: columnWidths[i],
              align: "left",
            });
            xPos += columnWidths[i];
          });

          doc.moveDown();
        });

        // Add inventory summary
        doc.moveDown(2);
        doc.font("Helvetica-Bold").fontSize(12).text("Inventory Summary");
        doc.moveDown(0.5);
        doc.font("Helvetica").fontSize(10);
        doc.text(`Total Products: ${products.length}`);
        doc.text(`Total Inventory Value: $${totalValue.toFixed(2)}`);
        doc.text(`Low Stock Items: ${lowStockCount}`);
        doc.text(`Out of Stock Items: ${outOfStockCount}`);

        // Add footer
        this._addFooter(doc);

        // Finalize the PDF
        doc.end();

        // When the stream is done, resolve with the path
        stream.on("finish", () => {
          resolve(outputPath);
        });

        stream.on("error", (error) => {
          reject(error);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  // Generate Sales Invoice
  async generateSalesInvoice(sale, customer, products) {
    return new Promise((resolve, reject) => {
      try {
        // Create a PDF document
        const doc = new PDFDocument({ margin: 50 });

        // Output file path
        const outputPath = path.join(
          __dirname,
          "../public/reports",
          `invoice_${sale.saleID}_${Date.now()}.pdf`
        );

        // Create directory if it doesn't exist
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        // Pipe output to file
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        // Add header
        this._addHeader(doc, "Sales Invoice");

        // Add invoice details
        doc.fontSize(10);
        doc.text(`Invoice #: ${sale.saleID}`, { align: "right" });
        doc.text(`Date: ${new Date(sale.saleDate).toLocaleDateString()}`, {
          align: "right",
        });
        doc.text(`Status: ${sale.status}`, { align: "right" });
        doc.moveDown(2);

        // Add customer information
        doc.font("Helvetica-Bold").fontSize(12).text("Customer Information:");
        doc.font("Helvetica").fontSize(10);
        doc.text(`Name: ${customer.name}`);
        doc.text(`Customer ID: ${customer.customerID}`);
        doc.text(`Email: ${customer.email}`);
        doc.text(`Phone: ${customer.phone}`);
        doc.moveDown(2);

        // Add items table
        doc.font("Helvetica-Bold").fontSize(12).text("Items Purchased:");
        doc.moveDown();

        // Table headers
        const tableTop = doc.y;
        const tableHeaders = ["Product", "Price", "Quantity", "Subtotal"];
        const columnWidths = [250, 80, 70, 80];

        // Draw table headers
        let xPos = 50;
        doc.font("Helvetica-Bold").fontSize(10);
        tableHeaders.forEach((header, i) => {
          const align = i === 0 ? "left" : "right";
          doc.text(header, xPos, tableTop, { width: columnWidths[i], align });
          xPos += columnWidths[i];
        });

        // Draw horizontal line
        doc.moveDown(0.5);
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);

        // Draw items
        doc.font("Helvetica").fontSize(10);
        sale.items.forEach((item, i) => {
          // Find product
          const product = products.find(
            (p) => p._id.toString() === item.product.toString()
          );
          const productName = product ? product.name : "Unknown Product";

          // Draw row with alternating background
          if (i % 2 === 1) {
            doc.rect(50, doc.y, 500, 20).fill("#f5f5f5");
            doc.fillColor("black");
          }

          // Draw data
          xPos = 50;
          const rowData = [
            productName,
            `$${item.price.toFixed(2)}`,
            item.quantity.toString(),
            `$${item.subtotal.toFixed(2)}`,
          ];

          const currentY = doc.y;
          rowData.forEach((data, i) => {
            const align = i === 0 ? "left" : "right";
            doc.text(data, xPos, currentY + 5, {
              width: columnWidths[i],
              align,
            });
            xPos += columnWidths[i];
          });

          doc.moveDown();
        });

        // Draw total
        doc.moveDown(0.5);
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);

        doc.font("Helvetica-Bold").fontSize(10);
        doc.text("Total:", 380, doc.y, { width: 100, align: "left" });
        doc.text(`$${sale.totalAmount.toFixed(2)}`, 480, doc.y, {
          width: 70,
          align: "right",
        });

        // Add payment method
        doc.moveDown();
        doc.font("Helvetica").fontSize(10);
        doc.text(`Payment Method: ${sale.paymentMethod}`);

        // Add thank you note
        doc.moveDown(2);
        doc
          .fontSize(11)
          .text("Thank you for shopping with TechTrove Electronics Shop!", {
            align: "center",
          });
        doc.moveDown(0.5);
        doc
          .fontSize(9)
          .text(
            "* Returns and exchanges accepted within 30 days with original receipt.",
            { align: "center" }
          );

        // Add footer
        this._addFooter(doc);

        // Finalize the PDF
        doc.end();

        // When the stream is done, resolve with the path
        stream.on("finish", () => {
          resolve(outputPath);
        });

        stream.on("error", (error) => {
          reject(error);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  // Add header to document
  _addHeader(doc, title) {
    // Add logo
    if (fs.existsSync(this.logoPath)) {
      doc.image(this.logoPath, 50, 45, { width: 50 });
      doc.moveDown();
    }

    // Add title
    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .text(this.companyInfo.name, 110, 50)
      .fontSize(16)
      .font("Helvetica")
      .text(title, 110);

    // Add company info
    doc
      .fontSize(10)
      .text(this.companyInfo.address, 110)
      .text(
        `Phone: ${this.companyInfo.phone} | Email: ${this.companyInfo.email}`,
        110
      );

    // Add separator line
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();
  }

  // Add footer to document
  _addFooter(doc) {
    const bottomOfPage = doc.page.height - 50;

    doc
      .fontSize(8)
      .text(
        "Created by: [Student Names] - [Student Numbers]",
        50,
        bottomOfPage - 20,
        { align: "center" }
      )
      .text(
        `Generated on ${new Date().toLocaleString()}`,
        50,
        bottomOfPage - 10,
        { align: "center" }
      )
      .text(
        `TechTrove Electronics Shop - ${this.companyInfo.website}`,
        50,
        bottomOfPage,
        { align: "center" }
      );
  }
}

module.exports = new PDFGenerator();
