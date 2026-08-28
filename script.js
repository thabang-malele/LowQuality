import PhotoSwipeLightbox from "./assets/photoswipe/photoswipe-lightbox.esm.js";

// 1. Initialize Lightbox Safely (Only if product grid exists)
if (document.querySelector(".product-grid")) {
    const lightbox = new PhotoSwipeLightbox({
        gallery: ".product-grid",
        children: ".product-image",
        pswpModule: () => import("./assets/photoswipe/photoswipe.esm.js")
    });
    lightbox.init();
}

// 2. LocalStorage Helpers
const CART_STORAGE_KEY = "lowquality_cart";

function getCart() {
    return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
}

function saveCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const cart = getCart();
    const countElement = document.getElementById("cart-count");
    if (countElement) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        countElement.textContent = totalItems;
    }
}

function addToCart(product) {
    let cart = getCart();
    
    const size = product.size || "M";
    const color = product.color || "Black";
    const cartItemId = `${product.id}-${size}-${color}`;

    const existingIndex = cart.findIndex(item => item.cartItemId === cartItemId);

    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({
            ...product,
            size,
            color,
            cartItemId,
            quantity: 1
        });
    }

    saveCart(cart);
}

function changeQuantity(cartItemId, delta) {
    let cart = getCart();
    const item = cart.find(i => i.cartItemId === cartItemId);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.cartItemId !== cartItemId);
        }
    }
    saveCart(cart);
    renderCartPage();
}

function removeItem(cartItemId) {
    let cart = getCart().filter(item => item.cartItemId !== cartItemId);
    saveCart(cart);
    renderCartPage();
}

function updateOption(cartItemId, optionKey, newValue) {
    let cart = getCart();
    const item = cart.find(i => i.cartItemId === cartItemId);
    if (item) {
        item[optionKey] = newValue;
        item.cartItemId = `${item.id}-${item.size}-${item.color}`;
    }
    saveCart(cart);
    renderCartPage();
}

// 3. Page Renderers
function renderCartPage() {
    const container = document.getElementById("cart-content");
    if (!container) return;

    const cart = getCart();

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart-msg">
                <p>Your cart is empty.</p>
                <br>
                <a href="merch.html" class="btn btn-light">Browse Merch</a>
            </div>
        `;
        return;
    }

    let total = 0;
    let rowsHtml = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        return `
            <tr>
                <td>
                    <div class="cart-item-info">
                        <img src="${item.img}" alt="${item.name}" class="cart-item-img">
                        <div>
                            <div><strong>${item.name}</strong></div>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="cart-options-cell">
                        <div class="cart-option-group">
                            <span>Size:</span>
                            <select class="cart-select size-select" data-cart-id="${item.cartItemId}">
                                <option value="S" ${item.size === 'S' ? 'selected' : ''}>S</option>
                                <option value="M" ${item.size === 'M' ? 'selected' : ''}>M</option>
                                <option value="L" ${item.size === 'L' ? 'selected' : ''}>L</option>
                                <option value="XL" ${item.size === 'XL' ? 'selected' : ''}>XL</option>
                            </select>
                        </div>
                        <div class="cart-option-group">
                            <span>Color:</span>
                            <select class="cart-select color-select" data-cart-id="${item.cartItemId}">
                                <option value="Black" ${item.color === 'Black' ? 'selected' : ''}>Black</option>
                                <option value="White" ${item.color === 'White' ? 'selected' : ''}>White</option>
                            </select>
                        </div>
                    </div>
                </td>
                <td>R${item.price.toFixed(2)}</td>
                <td>
                    <button class="qty-btn minus" data-cart-id="${item.cartItemId}">-</button>
                    <span style="margin: 0 8px;">${item.quantity}</span>
                    <button class="qty-btn plus" data-cart-id="${item.cartItemId}">+</button>
                </td>
                <td>R${itemTotal.toFixed(2)}</td>
                <td>
                    <button class="remove-btn" data-cart-id="${item.cartItemId}">Remove</button>
                </td>
            </tr>
        `;
    }).join("");

    container.innerHTML = `
        <table class="cart-table">
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Options</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                ${rowsHtml}
            </tbody>
        </table>

        <div class="cart-summary">
            <div class="cart-total">Total: R${total.toFixed(2)}</div>
            <a href="checkout.html" class="btn btn-light">Proceed to Checkout</a>
        </div>
    `;

    // Dropdown change listeners
    container.querySelectorAll(".size-select").forEach(select => {
        select.addEventListener("change", (e) => updateOption(e.target.dataset.cartId, "size", e.target.value));
    });
    container.querySelectorAll(".color-select").forEach(select => {
        select.addEventListener("change", (e) => updateOption(e.target.dataset.cartId, "color", e.target.value));
    });
}

function renderCheckoutPage() {
    const itemsContainer = document.getElementById("checkout-items-list");
    const totalElement = document.getElementById("checkout-total-price");
    const hiddenInput = document.getElementById("hidden-order-details");

    if (!itemsContainer) return;

    const cart = getCart();

    if (cart.length === 0) {
        window.location.href = "merch.html";
        return;
    }

    let total = 0;
    let summaryText = "ORDER SUMMARY:\n------------------\n";

    itemsContainer.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        summaryText += `${item.name} (${item.size} / ${item.color}) x${item.quantity} - R${itemTotal.toFixed(2)}\n`;

        return `
            <div class="checkout-item-row">
                <div>
                    <div><strong>${item.name}</strong></div>
                    <div class="checkout-item-meta">Size: ${item.size} | Color: ${item.color} | Qty: ${item.quantity} × R${item.price.toFixed(2)}</div>
                </div>
                <div>R${itemTotal.toFixed(2)}</div>
            </div>
        `;
    }).join("");

    summaryText += `------------------\nTOTAL: R${total.toFixed(2)}`;

    totalElement.textContent = `R${total.toFixed(2)}`;
    if (hiddenInput) hiddenInput.value = summaryText;
}

// 4. Page UI & Navigation
function initNavHighlight() {
    const navLinks = document.querySelectorAll("nav a");
    const currentPath = window.location.pathname.split("/").pop() || "index.html";

    navLinks.forEach(link => {
        const linkPath = link.getAttribute("href").split("#")[0];
        if (linkPath && linkPath === currentPath) {
            navLinks.forEach(l => l.classList.remove("active"));
            link.classList.add("active");
        }
    });
}

function initPageTransitions() {
    document.body.classList.add("fade-in");
    document.querySelectorAll("a").forEach(link => {
        const href = link.getAttribute("href");
        if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto:")) return;

        const currentPage = window.location.pathname.split("/").pop() || "index.html";
        const targetPage = href.split("#")[0];

        if (targetPage && targetPage !== currentPage) {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                document.body.classList.remove("fade-in");
                document.body.classList.add("fade-out");
                setTimeout(() => { window.location.href = href; }, 350);
            });
        }
    });
}

// 5. Global Initialization & Click Delegation
document.addEventListener("DOMContentLoaded", () => {
    initPageTransitions();
    updateCartCount();
    renderCartPage();
    renderCheckoutPage();
    initNavHighlight();

    // Universal click handler
    document.body.addEventListener("click", (e) => {
        // Add to Cart
        const addBtn = e.target.closest(".add-to-cart-btn");
        if (addBtn) {
            e.preventDefault();
            e.stopPropagation();

            const product = {
                id: addBtn.dataset.id,
                name: addBtn.dataset.name,
                price: parseFloat(addBtn.dataset.price),
                img: addBtn.dataset.img
            };

            addToCart(product);

            const originalText = addBtn.textContent;
            addBtn.textContent = "Added!";
            addBtn.style.opacity = "0.7";

            setTimeout(() => {
                addBtn.textContent = originalText;
                addBtn.style.opacity = "1";
            }, 1000);
            return;
        }

        // Cart Quantities
        const qtyBtn = e.target.closest(".qty-btn");
        if (qtyBtn) {
            e.preventDefault();
            const cartId = qtyBtn.dataset.cartId;
            if (qtyBtn.classList.contains("plus")) changeQuantity(cartId, 1);
            if (qtyBtn.classList.contains("minus")) changeQuantity(cartId, -1);
            return;
        }

        // Cart Item Removal
        const removeBtn = e.target.closest(".remove-btn");
        if (removeBtn) {
            e.preventDefault();
            removeItem(removeBtn.dataset.cartId);
            return;
        }
    });
});
