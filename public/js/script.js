// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Font size control
  setupFontSizeControls();

  // Delete confirmation handlers
  setupDeleteHandlers();

  // Sale form dynamic items
  setupSaleForm();

  // Form validation
  setupFormValidation();
});

// Font size control functionality
function setupFontSizeControls() {
  const increaseBtn = document.getElementById("increase-font");
  const decreaseBtn = document.getElementById("decrease-font");
  const resetBtn = document.getElementById("reset-font");

  if (increaseBtn && decreaseBtn && resetBtn) {
    // Set initial font size from localStorage or default
    let currentSize = localStorage.getItem("fontSize") || 16;
    document.documentElement.style.fontSize = currentSize + "px";

    // Increase font size
    increaseBtn.addEventListener("click", function () {
      if (currentSize < 24) {
        currentSize = parseInt(currentSize) + 2;
        document.documentElement.style.fontSize = currentSize + "px";
        localStorage.setItem("fontSize", currentSize);
      }
    });

    // Decrease font size
    decreaseBtn.addEventListener("click", function () {
      if (currentSize > 12) {
        currentSize = parseInt(currentSize) - 2;
        document.documentElement.style.fontSize = currentSize + "px";
        localStorage.setItem("fontSize", currentSize);
      }
    });

    // Reset font size
    resetBtn.addEventListener("click", function () {
      currentSize = 16;
      document.documentElement.style.fontSize = currentSize + "px";
      localStorage.setItem("fontSize", currentSize);
    });
  }
}

// Setup delete confirmation handlers
function setupDeleteHandlers() {
  const deleteButtons = document.querySelectorAll(".delete-btn");

  deleteButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();

      const id = this.getAttribute("data-id");
      const itemType = this.getAttribute("data-type");

      if (confirm(`Are you sure you want to delete this ${itemType}?`)) {
        // Send DELETE request using fetch API
        fetch(`/${itemType}s/${id}`, {
          method: "DELETE",
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              // Reload the page after successful deletion
              window.location.reload();
            } else {
              alert(`Error: ${data.message}`);
            }
          })
          .catch((error) => {
            console.error("Error:", error);
            alert("An error occurred while deleting the item.");
          });
      }
    });
  });
}

// Setup sale form functionality
function setupSaleForm() {
  const addItemBtn = document.getElementById("add-item-btn");
  const itemsContainer = document.getElementById("sale-items");

  if (addItemBtn && itemsContainer) {
    addItemBtn.addEventListener("click", function () {
      // Clone the first item row
      const firstItem = document.querySelector(".item-row");
      const newItem = firstItem.cloneNode(true);

      // Clear the values in the new item
      const inputs = newItem.querySelectorAll("input, select");
      inputs.forEach((input) => {
        if (input.type !== "hidden") {
          input.value = "";
        }

        // Update the name attribute for arrays
        const name = input.getAttribute("name");
        if (name) {
          const nameWithoutIndex = name.replace(/\[\d+\]/, "");
          const itemCount = document.querySelectorAll(".item-row").length;
          input.setAttribute("name", `${nameWithoutIndex}[${itemCount}]`);
        }
      });

      // Add remove button if it's not the first item
      if (!newItem.querySelector(".remove-item-btn")) {
        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "btn btn-sm btn-danger remove-item-btn";
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        removeBtn.addEventListener("click", function () {
          this.closest(".item-row").remove();
          updateSubtotals();
        });

        newItem.appendChild(removeBtn);
      }

      // Add the new item to the container
      itemsContainer.appendChild(newItem);

      // Setup change handlers for the new item
      setupItemChangeHandlers(newItem);
    });

    // Setup handlers for existing items
    document.querySelectorAll(".item-row").forEach((item) => {
      setupItemChangeHandlers(item);
    });

    // Initial calculation
    updateSubtotals();
  }
}

// Setup change handlers for item rows
function setupItemChangeHandlers(itemRow) {
  const productSelect = itemRow.querySelector(".product-select");
  const quantityInput = itemRow.querySelector(".quantity-input");

  if (productSelect) {
    productSelect.addEventListener("change", function () {
      updateSubtotals();
    });
  }

  if (quantityInput) {
    quantityInput.addEventListener("input", function () {
      updateSubtotals();
    });
  }
}

// Update subtotals and total for sale form
function updateSubtotals() {
  const itemRows = document.querySelectorAll(".item-row");
  let total = 0;

  itemRows.forEach((row) => {
    const productSelect = row.querySelector(".product-select");
    const quantityInput = row.querySelector(".quantity-input");
    const priceInput = row.querySelector(".price-input");
    const subtotalInput = row.querySelector(".subtotal-input");

    if (productSelect && quantityInput && priceInput && subtotalInput) {
      const selectedOption = productSelect.options[productSelect.selectedIndex];
      const price = selectedOption
        ? parseFloat(selectedOption.getAttribute("data-price") || 0)
        : 0;
      const quantity = parseInt(quantityInput.value) || 0;

      const subtotal = price * quantity;

      priceInput.value = price.toFixed(2);
      subtotalInput.value = subtotal.toFixed(2);

      total += subtotal;
    }
  });

  // Update total amount
  const totalInput = document.getElementById("total-amount");
  if (totalInput) {
    totalInput.value = total.toFixed(2);
  }
}

// Form validation
function setupFormValidation() {
  const forms = document.querySelectorAll('form[data-validate="true"]');

  forms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      const requiredFields = form.querySelectorAll("[required]");
      let hasError = false;

      requiredFields.forEach((field) => {
        const errorElement = document.getElementById(`error-${field.id}`);

        if (!field.value.trim()) {
          e.preventDefault();
          hasError = true;

          field.classList.add("is-invalid");
          if (errorElement) {
            errorElement.textContent = "This field is required";
          }
        } else {
          field.classList.remove("is-invalid");
          if (errorElement) {
            errorElement.textContent = "";
          }
        }
      });

      // Validate email fields
      const emailFields = form.querySelectorAll('input[type="email"]');
      emailFields.forEach((field) => {
        if (field.value.trim() && !validateEmail(field.value)) {
          e.preventDefault();
          hasError = true;

          field.classList.add("is-invalid");
          const errorElement = document.getElementById(`error-${field.id}`);
          if (errorElement) {
            errorElement.textContent = "Please enter a valid email address";
          }
        }
      });

      return !hasError;
    });
  });
}

// Email validation helper
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
