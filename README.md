# Sales-Management-and-Invoice-Generation-System
Sales Management and Invoice System — a Node.js project designed to manage customers, products, and sales, while dynamically generating PDF invoices and reports.


📋 Project Overview
This project simulates a basic Database-driven Sales Management Application where users can:

Create, read, update, and delete (CRUD) customer, product, and sales data.

Generate and download professional PDF invoices and report summaries.

Interact with a database-backed API using Express.js.

🛠️ Tech Stack
Node.js

Express.js

MongoDB (or a mock database depending on setup)

PDFKit (for generating PDFs)

HTML5 / CSS3 (for frontend interface)

Postman (for API testing)

📁 Folder Structure
bash
Copy
Edit
/controllers
    ├── customer.controller.js   # Customer operations
    ├── product.controller.js    # Product operations
    ├── sale.controller.js       # Sales operations
    └── pdf.controller.js        # PDF generation logic

/models
    ├── customer.model.js
    ├── product.model.js
    └── sale.model.js

/public
    ├── css/
    └── images/

/Invoices
    └── (Generated PDF invoices and reports)

/index.js                      # Main application entry point
/package.json                   # Project metadata and dependencies
✨ Features
📄 Customer Management: Add, update, view, and delete customers.

🛒 Product Management: Add, update, view, and delete products.

📈 Sales Tracking: Create and view sales records.

📑 PDF Reports:

Auto-generate invoices for specific transactions.

Generate customer and product reports in PDF format.

🎨 Simple Frontend: Styled with custom CSS for basic UI interaction.


NOTE: NO NODE MODULES INCLUDED

