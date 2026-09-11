(() => {
  const storageKey = "dee-made-cart";
  const whatsappNumber = "27814551135";
  const cart = JSON.parse(localStorage.getItem(storageKey) || "[]");

  const saveCart = () => {
    localStorage.setItem(storageKey, JSON.stringify(cart));
  };

  const formatPrice = (value) => `R${value.toFixed(2)}`;

  const renderCart = () => {
    const items = document.querySelector(".cart-items");
    const total = document.querySelector(".cart-total-value");
    const count = document.querySelectorAll(".cart-count");
    const empty = document.querySelector(".cart-empty");
    const whatsappButton = document.querySelector(".whatsapp-button");

    if (!items || !total) return;

    items.innerHTML = "";
    let itemCount = 0;
    let cartTotal = 0;

    cart.forEach((item, index) => {
      itemCount += item.quantity;
      cartTotal += item.price * item.quantity;
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `
        <div>
          <strong>${item.name}</strong>
          <span>${formatPrice(item.price)} each</span>
        </div>
        <div class="cart-item-actions">
          <button type="button" class="quantity-button" data-cart-action="decrease" data-index="${index}" aria-label="Decrease ${item.name} quantity">-</button>
          <span aria-label="Quantity">${item.quantity}</span>
          <button type="button" class="quantity-button" data-cart-action="increase" data-index="${index}" aria-label="Increase ${item.name} quantity">+</button>
          <button type="button" class="remove-item" data-cart-action="remove" data-index="${index}">Remove</button>
        </div>`;
      items.append(row);
    });

    total.textContent = formatPrice(cartTotal);
    count.forEach((badge) => {
      badge.textContent = itemCount;
      badge.hidden = false;
    });
    empty.hidden = itemCount > 0;
    whatsappButton.disabled = itemCount === 0;
  };

  const setDrawerState = (open) => {
    const drawer = document.querySelector(".cart-drawer");
    const closeButton = document.querySelector(".cart-close");
    if (!drawer) return;
    drawer.classList.toggle("is-open", open);
    drawer.setAttribute("aria-hidden", String(!open));
    if (open) closeButton.focus();
  };

  const addToCart = (button) => {
    const product = {
      name: button.dataset.product,
      price: Number(button.dataset.price)
    };
    const existing = cart.find((item) => item.name === product.name);
    if (existing) existing.quantity += 1;
    else cart.push({ ...product, quantity: 1 });
    saveCart();
    renderCart();
    setDrawerState(true);
  };

  const setupMobileMenu = () => {
    const menuButton = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".nav-links");
    if (!menuButton || !nav) return;
    menuButton.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
    });
  };

  document.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add-to-cart]");
    if (addButton) addToCart(addButton);

    const cartToggle = event.target.closest(".cart-toggle");
    if (cartToggle) setDrawerState(true);

    if (event.target.closest(".cart-close") || event.target.classList.contains("cart-backdrop")) {
      setDrawerState(false);
    }

    const cartAction = event.target.closest("[data-cart-action]");
    if (cartAction) {
      const index = Number(cartAction.dataset.index);
      const action = cartAction.dataset.cartAction;
      if (action === "increase") cart[index].quantity += 1;
      if (action === "decrease") cart[index].quantity -= 1;
      if (action === "remove" || cart[index].quantity < 1) cart.splice(index, 1);
      saveCart();
      renderCart();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setDrawerState(false);
  });

  document.querySelector(".whatsapp-button")?.addEventListener("click", () => {
    const notice = document.querySelector(".cart-notice");
    if (!cart.length) {
      notice.textContent = "Add an item to your cart before requesting payment.";
      return;
    }

    if (whatsappNumber === "YOUR_WHATSAPP_NUMBER") {
      notice.textContent = "Add the business WhatsApp number in cart.js before using this button.";
      return;
    }

    const lines = cart.map((item) => `- ${item.name} x${item.quantity}: ${formatPrice(item.price * item.quantity)}`);
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const message = [
      "Hi Dee-Made byhand, I would like to place this order:",
      "",
      ...lines,
      "",
      `Order total: ${formatPrice(total)}`,
      "Please send me the payment details for this order. Thank you."
    ].join("\n");
    window.location.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  });

  document.querySelector(".contact-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const status = document.querySelector(".form-status");
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    status.textContent = "Thanks. Your message is ready to be sent. We will be in touch soon.";
    status.className = "form-status success";
    form.reset();
  });

  setupMobileMenu();
  renderCart();
})();
