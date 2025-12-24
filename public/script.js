const list = document.getElementById("list");

async function loadItems() {
  try {
    const res = await fetch("/api/items");
    if (!res.ok) throw new Error("Failed to load items");
    const items = await res.json();

    list.innerHTML = "";
    items.forEach(item => {
      const li = document.createElement("li");
      li.innerHTML = `
        ${item.name} - <strong>${item.quantity}</strong>
        ${item.quantity < 5 ? "⚠ LOW STOCK" : ""}
        <button onclick="changeQty('${item._id}', 1)">➕</button>
        <button onclick="changeQty('${item._id}', -1)">➖</button>
        <button onclick="deleteItem('${item._id}')">❌</button>
        <button onclick="updateItem('${item._id}')">✏️</button>
      `;
      list.appendChild(li);
    });
  } catch (err) {
    console.error(err);
    alert("Error loading items. Please try again.");
  }
}

async function addItem() {
  const name = document.getElementById("name").value.trim();
  const quantity = parseInt(document.getElementById("quantity").value);

  // Validation
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

    let newQty = prompt("Please enter updated quantity:", item.quantity);
    if (newQty === null) return; // user canceled
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
  try {
    const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete item");
    loadItems();
  } catch (err) {
    console.error(err);
    alert("Error deleting item. Please try again.");
  }
}

loadItems();
