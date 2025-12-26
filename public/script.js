const list = document.getElementById("list");
const searchInput = document.getElementById("search");
const lowStockFilter = document.getElementById("lowStockFilter");

let itemsCache = [];

async function loadItems() {
  try {
    const res = await fetch("/api/items");
    if (!res.ok) throw new Error("Failed to load items");
    const items = await res.json();

    itemsCache = items;
    renderList();
  } catch (err) {
    console.error(err);
    alert("Error loading items. Please try again.");
  }
}

function renderList() {
  const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
  const filterLowStock = lowStockFilter ? lowStockFilter.checked : false;

  list.innerHTML = "";
  
  let filteredItems = itemsCache;
  
  if (searchTerm) {
    filteredItems = filteredItems.filter(item => 
      item.name.toLowerCase().includes(searchTerm)
    );
  }
  
  if (filterLowStock) {
    filteredItems = filteredItems.filter(item => item.quantity < 30);
  }

  if (filteredItems.length === 0) {
    const li = document.createElement("li");
    li.className = "no-results";
    li.textContent = searchTerm || filterLowStock 
      ? "No items match your search/filter" 
      : "No items in inventory. Add your first item above!";
    list.appendChild(li);
    return;
  }

  filteredItems.forEach(item => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="item-info">
        <span class="${item.quantity < 30 ? 'low-stock' : ''}">
          ${item.name} - <strong>${item.quantity}</strong>
          ${item.quantity < 30 ? "⚠ LOW STOCK" : ""}
        </span>
      </div>
      <div class="item-actions">
        <button class="action-btn btn-increase" onclick="changeQty('${item._id}', 1)">➕</button>
        <button class="action-btn btn-decrease" onclick="changeQty('${item._id}', -1)">➖</button>
        <button class="action-btn btn-edit" onclick="updateItem('${item._id}')">✏️</button>
        <button class="action-btn btn-delete" onclick="deleteItem('${item._id}')">❌</button>
      </div>
    `;
    list.appendChild(li);
  });
}

async function addItem() {
  const name = document.getElementById("name").value.trim();
  const quantity = parseInt(document.getElementById("quantity").value);

  if (!name) {
    return alert("Item name cannot be empty");
  }
  if (isNaN(quantity) || quantity < 0) {
    return alert("Quantity must be a non-negative number");
  }

  try {
    const res = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, quantity })
    });

    if (!res.ok) throw new Error("Failed to add item");
    
    document.getElementById("name").value = "";
    document.getElementById("quantity").value = "";
    loadItems();
  } catch (err) {
    console.error(err);
    alert("Error adding item. Please try again.");
  }
}

async function changeQty(id, amount) {
  try {
    const res = await fetch("/api/items");
    if (!res.ok) throw new Error("Failed to fetch items");
    const items = await res.json();

    const item = items.find(i => i._id === id);
    if (!item) return alert("Item not found");

    const newQty = item.quantity + amount;
    if (newQty < 0) return alert("Quantity cannot be negative");

    const updateRes = await fetch(`/api/items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: newQty })
    });

    if (!updateRes.ok) throw new Error("Failed to update item");
    loadItems();
  } catch (err) {
    console.error(err);
    alert("Error updating item. Please try again.");
  }
}

async function updateItem(id) {
  try {
    const res = await fetch("/api/items");
    if (!res.ok) throw new Error("Failed to fetch items");
    const items = await res.json();

    const item = items.find(i => i._id === id);
    if (!item) return alert("Item not found");

    let newQty = prompt(`Update quantity for "${item.name}":`, item.quantity);
    if (newQty === null) return;
    newQty = parseInt(newQty);

    if (isNaN(newQty) || newQty < 0) {
      return alert("Quantity must be a non-negative number");
    }

    const updateRes = await fetch(`/api/items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: newQty })
    });

    if (!updateRes.ok) throw new Error("Failed to update item");
    loadItems();
  } catch (err) {
    console.error(err);
    alert("Error updating item. Please try again.");
  }
}

async function deleteItem(id) {
  if (!confirm("Are you sure you want to delete this item?")) {
    return;
  }
  
  try {
    const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete item");
    loadItems();
  } catch (err) {
    console.error(err);
    alert("Error deleting item. Please try again.");
  }
}

if (searchInput) {
  searchInput.addEventListener("input", renderList);
}

if (lowStockFilter) {
  lowStockFilter.addEventListener("change", renderList);
}

loadItems();