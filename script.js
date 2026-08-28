import PhotoSwipeLightbox from "./assets/photoswipe/photoswipe-lightbox.esm.js";

/* ==========================================================================
   1. Data Store (Single Source of Truth for Scalable Products)
   ========================================================================== */
const PRODUCTS = [
    { id: "lq-hoodie", name: "LQ Weighted Hoodie", price: 499.00, desc: "Classic Heavyweight hoodie with centered chest logo.", img: "assets/apparel/hoodie_bw.webp", featured: true },
    { id: "lq-tshirt", name: "LQ T-Shirt", price: 249.00, desc: "Classic oversized tee with centered chest logo.", img: "assets/apparel/shirt_wb.webp", featured: true },
    { id: "lq-cargo-pants", name: "LQ Weighted Cargo Pants", price: 399.00, desc: "Classic Heavyweight cargo pants with striped branding.", img: "assets/apparel/cargopants_b.webp", featured: false },
    { id: "lq-sweatpants", name: "LQ Sweatpants", price: 299.00, desc: "Classic oversized sweatpants with centered chest logo.", img: "assets/apparel/sweatpants_g.webp", featured: false },
    { id: "lq-tote", name: "LQ Tote Bag", price: 149.99, desc: "Minimal canvas tote built for everyday use and carry.", img: "assets/apparel/bag_wb.webp", featured: true },
    { id: "lq-bucket-hat", name: "LQ Bucket Hat", price: 199.99, desc: "Clean, minimal, everyday bucket hat with tagged logo.", img: "assets/apparel/bucket_hat_wb.webp", featured: true },
    { id: "lq-gloves", name: "LQ Gloves", price: 99.99, desc: "Clean, minimal, fingerless gloves with tagged logo.", img: "assets/apparel/glove_b.webp", featured: false },
    { id: "lq-socks", name: "LQ Socks", price: 79.99, desc: "Minimal canvas socks tailored for everyday comfort.", img: "assets/apparel/socks_w.webp", featured: false }
];

/* ==========================================================================
   2. Cart & Storage Module
   ========================================================================== */
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

function addToCart(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    let cart = getCart();
    const size = "M";
    const color = "Black";
    const cartItemId = `${product.id}-${size}-${color}`;

    const existingIndex = cart.findIndex(item => item.cartItemId === cartItemId);

    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({ ...product, size, color, cartItemId, quantity: 1 });
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

/* ==========================================================================
   3. UI & Catalog Renderers
   ========================================================================== */
function renderProductGrid() {
    const grid = document.querySelector(".product-grid");
    if (!grid) return;

    const isFeaturedPage = document.body.contains(document.getElementById("featured"));
    const itemsToRender = isFeaturedPage
        ? PRODUCTS.filter(p => p.featured)
        : PRODUCTS;

    grid.innerHTML = itemsToRender.map(product => `
        <article class="product-card">
            <a class="product-image" href="${product.img}" data-pswp-width="1024" data-pswp-height="1024" target="_blank">
                <img src="${product.img}" alt="${product.name}">
            </a>
            <br>
            <h3>${product.name}</h3>
            <p class="price">R${product.price.toFixed(2)}</p>
            <p>${product.desc}</p>
            <button class="add-to-cart-btn btn btn-light" data-id="${product.id}">
                Add to Cart
            </button>
        </article>
    `).join("");

    initPhotoSwipe();
}

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
    const rowsHtml = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        return `
            <tr>
                <td>
                    <div class="cart-item-info">
                        <img src="${item.img}" alt="${item.name}" class="cart-item-img">
                        <div><strong>${item.name}</strong></div>
                    </div>
                </td>
                <td>
                    <div class="cart-options-cell">
                        <div class="cart-option-group">
                            <span>Size:</span>
                            <select class="cart-select size-select" data-cart-id="${item.cartItemId}">
                                ${["S", "M", "L", "XL"].map(s => `<option value="${s}" ${item.size === s ? 'selected' : ''}>${s}</option>`).join('')}
                            </select>
                        </div>
                        <div class="cart-option-group">
                            <span>Color:</span>
                            <select class="cart-select color-select" data-cart-id="${item.cartItemId}">
                                ${["Black", "White"].map(c => `<option value="${c}" ${item.color === c ? 'selected' : ''}>${c}</option>`).join('')}
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
                <td><button class="remove-btn" data-cart-id="${item.cartItemId}">Remove</button></td>
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
            <tbody>${rowsHtml}</tbody>
        </table>
        <div class="cart-summary">
            <div class="cart-total">Total: R${total.toFixed(2)}</div>
            <a href="checkout.html" class="btn btn-light">Proceed to Checkout</a>
        </div>
    `;

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

function initCheckoutFormListener() {
    const checkoutForm = document.getElementById("checkout-form");
    if (!checkoutForm) return;

    checkoutForm.addEventListener("submit", (e) => {
        const emailInput = document.getElementById("customer-email");
        if (emailInput && emailInput.value) {
            // Store the user's email in local storage upon checkout submission
            localStorage.setItem("customerEmail", emailInput.value.trim());
        }
    });
}

function initYocoPaymentLink() {
    const payBtn = document.getElementById('yoco-pay-btn');
    if (!payBtn) return;

    // 1. Fetch dynamic amount from cart logic
    const cart = getCart();
    const computedTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const finalAmount = computedTotal > 0 ? computedTotal.toFixed(2) : '150.00';

    // 2. Fetch the stored email address, with a fallback if empty
    const customerEmail = localStorage.getItem('customerEmail') || 'customer@example.com';

    // 3. Construct Yoco link using the email address as the reference parameter
    const baseUrl = "https://pay.yoco.com/lowquality-pty-ltd";
    payBtn.href = `${baseUrl}?amount=${finalAmount}&reference=${encodeURIComponent(customerEmail)}`;
}

/* ==========================================================================
   4. Application Utilities (Theme, Nav, Transitions)
   ========================================================================== */
function initPhotoSwipe() {
    if (document.querySelector(".product-grid")) {
        const lightbox = new PhotoSwipeLightbox({
            gallery: ".product-grid",
            children: ".product-image",
            pswpModule: () => import("./assets/photoswipe/photoswipe.esm.js")
        });
        lightbox.init();
    }
}

function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("lowquality_theme", theme);

    const logo = document.getElementById("site-logo");
    if (logo) {
        logo.src = theme === "dark" ? "assets/icons/logo_b.png" : "assets/icons/logo_w.png";
    }

    const icon = document.getElementById("theme-icon");
    if (icon) {
        icon.textContent = theme === "dark" ? "☀️" : "🌙";
    }
}

function initTheme() {
    const savedTheme = localStorage.getItem("lowquality_theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");

    setTheme(initialTheme);

    const toggleBtn = document.getElementById("theme-toggle");
    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
            setTheme(currentTheme === "dark" ? "light" : "dark");
        });
    }
}

function initNavHighlight() {
    const navLinks = document.querySelectorAll("nav a");
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    const currentHash = window.location.hash;

    navLinks.forEach(link => {
        const href = link.getAttribute("href");
        if (!href) return;

        const [linkPath, linkHash] = href.split("#");
        const targetPath = linkPath || "index.html";
        const targetHash = linkHash ? `#${linkHash}` : "";

        if (targetPath === currentPath) {
            if (currentHash) {
                link.classList.toggle("active", targetHash === currentHash);
            } else {
                link.classList.toggle("active", targetHash === "#home" || targetHash === "");
            }
        } else {
            link.classList.remove("active");
        }
    });
}

window.addEventListener("hashchange", initNavHighlight);

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

function initMobileMenu() {
    const toggleBtn = document.getElementById("mobile-menu-toggle");
    const navMenu = document.getElementById("nav-menu");
    const navLinks = document.querySelectorAll("nav a");

    if (!toggleBtn || !navMenu) return;

    toggleBtn.addEventListener("click", () => {
        const isOpen = navMenu.classList.toggle("open");
        toggleBtn.classList.toggle("open", isOpen);
    });

    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            navMenu.classList.remove("open");
            toggleBtn.classList.remove("open");
        });
    });
}

/* ==========================================================================
   5. Event Listeners & Global Handlers
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    renderProductGrid();
    updateCartCount();
    renderCartPage();
    renderCheckoutPage();
    initYocoPaymentLink();
    initNavHighlight();
    initPageTransitions();
    initMobileMenu();
    initCheckoutFormListener();

    document.body.addEventListener("click", (e) => {
        const addBtn = e.target.closest(".add-to-cart-btn");
        if (addBtn) {
            e.preventDefault();
            addToCart(addBtn.dataset.id);

            const originalText = addBtn.textContent;
            addBtn.textContent = "Added!";
            addBtn.style.opacity = "0.7";
            setTimeout(() => {
                addBtn.textContent = originalText;
                addBtn.style.opacity = "1";
            }, 1000);
            return;
        }

        const qtyBtn = e.target.closest(".qty-btn");
        if (qtyBtn) {
            e.preventDefault();
            const cartId = qtyBtn.dataset.cartId;
            if (qtyBtn.classList.contains("plus")) changeQuantity(cartId, 1);
            if (qtyBtn.classList.contains("minus")) changeQuantity(cartId, -1);
            return;
        }

        const removeBtn = e.target.closest(".remove-btn");
        if (removeBtn) {
            e.preventDefault();
            removeItem(removeBtn.dataset.cartId);
            return;
        }
    });
});
