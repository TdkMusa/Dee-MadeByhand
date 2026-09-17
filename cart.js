(() => {
  const storageKey = "dee-made-cart";
  const whatsappNumber = "27716949601";
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
    const qrButton = document.querySelector(".qr-pay-button");
    const directQrButton = document.querySelector(".direct-qr-pay-button");

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
    if (qrButton) qrButton.disabled = itemCount === 0;
    if (directQrButton) directQrButton.disabled = itemCount === 0;
  };

  const setDrawerState = (open) => {
    const drawer = document.querySelector(".cart-drawer");
    const closeButton = document.querySelector(".cart-close");
    if (!drawer) return;
    drawer.classList.toggle("is-open", open);
    drawer.setAttribute("aria-hidden", String(!open));
    if (open) closeButton.focus();
  };

  const setSaltPickerState = (open) => {
    const picker = document.querySelector(".salt-picker");
    const closeButton = document.querySelector(".salt-picker-close");
    if (!picker) return;
    picker.classList.toggle("is-open", open);
    picker.setAttribute("aria-hidden", String(!open));
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

  const addSaltToCart = (button) => {
    const product = {
      name: `Bath Salts - ${button.dataset.saltName}`,
      price: Number(button.dataset.saltPrice)
    };
    const existing = cart.find((item) => item.name === product.name);
    if (existing) existing.quantity += 1;
    else cart.push({ ...product, quantity: 1 });
    saveCart();
    renderCart();
    setSaltPickerState(false);
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

  const getPaymentMessage = () => {
    const lines = cart.map((item) => `- ${item.name} x${item.quantity}: ${formatPrice(item.price * item.quantity)}`);
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return [
      "Hi Dee-Made byhand, I would like to place this order:",
      "",
      ...lines,
      "",
      `Order total: ${formatPrice(total)}`,
      "Please send me the payment details for this order. Thank you."
    ].join("\n");
  };

  const setupQrPayment = () => {
    const whatsappButton = document.querySelector(".whatsapp-button");
    const cartPanel = document.querySelector(".cart-panel");
    if (!whatsappButton || !cartPanel) return;

    const paymentOptions = document.createElement("div");
    paymentOptions.className = "payment-options";
    whatsappButton.parentNode.insertBefore(paymentOptions, whatsappButton);

    const qrButton = document.createElement("button");
    qrButton.className = "btn qr-pay-button";
    qrButton.type = "button";
    qrButton.textContent = "Scan to pay via WhatsApp";
    qrButton.disabled = cart.length === 0;
    paymentOptions.append(qrButton);

    const directQrButton = document.createElement("button");
    directQrButton.className = "btn direct-qr-pay-button";
    directQrButton.type = "button";
    directQrButton.textContent = "Scan to pay direct";
    directQrButton.disabled = cart.length === 0;
    paymentOptions.append(directQrButton);

    const qrModal = document.createElement("div");
    qrModal.className = "qr-payment-modal";
    qrModal.setAttribute("aria-hidden", "true");
    qrModal.innerHTML = `
      <div class="qr-payment-backdrop"></div>
      <section class="qr-payment-panel" role="dialog" aria-modal="true" aria-labelledby="qr-payment-title">
        <div class="qr-payment-header">
          <h2 id="qr-payment-title">Scan to pay</h2>
          <button class="qr-payment-close" type="button" aria-label="Close scan to pay">Close</button>
        </div>
        <img class="qr-payment-image" alt="QR code for this order's WhatsApp payment request" />
        <p class="qr-payment-total"></p>
        <p class="qr-payment-help">Scan this code with your phone to send your order and request payment details on WhatsApp.</p>
      </section>`;
    document.body.append(qrModal);

    const closeQrModal = () => {
      qrModal.classList.remove("is-open");
      qrModal.setAttribute("aria-hidden", "true");
    };

    qrButton.addEventListener("click", () => {
      if (!cart.length) return;
      const paymentUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(getPaymentMessage())}`;
      const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      qrModal.querySelector(".qr-payment-image").src = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(paymentUrl)}`;
      qrModal.querySelector(".qr-payment-total").textContent = `Order total: ${formatPrice(total)}`;
      qrModal.classList.add("is-open");
      qrModal.setAttribute("aria-hidden", "false");
      qrModal.querySelector(".qr-payment-close").focus();
    });

    qrModal.addEventListener("click", (event) => {
      if (event.target.closest(".qr-payment-close") || event.target.classList.contains("qr-payment-backdrop")) closeQrModal();
    });

    const directQrModal = document.createElement("div");
    directQrModal.className = "qr-payment-modal direct-qr-modal";
    directQrModal.setAttribute("aria-hidden", "true");
    directQrModal.innerHTML = `
      <div class="qr-payment-backdrop"></div>
      <section class="qr-payment-panel" role="dialog" aria-modal="true" aria-labelledby="direct-qr-title">
        <div class="qr-payment-header">
          <h2 id="direct-qr-title">Scan to pay direct</h2>
          <button class="qr-payment-close" type="button" aria-label="Close direct payment QR code">Close</button>
        </div>
        <div class="direct-qr-placeholder" role="img" aria-label="Direct bank QR code placeholder">Direct bank QR code<br />coming soon</div>
        <p class="qr-payment-help">The direct bank payment QR code will be added here soon.</p>
      </section>`;
    document.body.append(directQrModal);

    const closeDirectQrModal = () => {
      directQrModal.classList.remove("is-open");
      directQrModal.setAttribute("aria-hidden", "true");
    };

    directQrButton.addEventListener("click", () => {
      if (!cart.length) return;
      directQrModal.classList.add("is-open");
      directQrModal.setAttribute("aria-hidden", "false");
      directQrModal.querySelector(".qr-payment-close").focus();
    });

    directQrModal.addEventListener("click", (event) => {
      if (event.target.closest(".qr-payment-close") || event.target.classList.contains("qr-payment-backdrop")) closeDirectQrModal();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeQrModal();
      if (event.key === "Escape") closeDirectQrModal();
    });
  };

  document.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add-to-cart]");
    if (addButton) addToCart(addButton);

    const saltTrigger = event.target.closest("[data-select-bath-salts]");
    if (saltTrigger) setSaltPickerState(true);

    const saltOption = event.target.closest("[data-salt-name]");
    if (saltOption) addSaltToCart(saltOption);

    const cartToggle = event.target.closest(".cart-toggle");
    if (cartToggle) setDrawerState(true);

    if (event.target.closest(".cart-close") || event.target.classList.contains("cart-backdrop")) {
      setDrawerState(false);
    }

    if (event.target.closest(".salt-picker-close") || event.target.classList.contains("salt-picker-backdrop")) {
      setSaltPickerState(false);
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
    if (event.key === "Escape") setSaltPickerState(false);
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

    window.location.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(getPaymentMessage())}`;
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
  setupQrPayment();
  renderCart();
})();
