<script>
    const WHATSAPP_NUMBER = "256772844881";
    const EMAIL_TO = "drxpatt@gmail.com";
    const DELIVERY_THRESHOLD = 50000;

    const products = [
      { id: "p1",  name: "Rice (5kg)",           price: 45000, unit: "bag",    image: "rice-5kg.jpg" },
      { id: "p2",  name: "Sugar (1kg)",          price: 4500,  unit: "kg",     image: "sugar-1kg.jpg" },
      { id: "p3",  name: "Cooking Oil (1L)",     price: 13000, unit: "bottle", image: "cooking-oil-1l.jpg" },
      { id: "p4",  name: "Bread (Loaf)",         price: 5500,  unit: "loaf",   image: "bread-loaf.jpg" },
      { id: "p5",  name: "Milk (500ml)",         price: 2000,  unit: "pack",   image: "milk-500ml.jpg" },
      { id: "p6",  name: "Eggs (Tray)",          price: 12000, unit: "tray",   image: "eggs-tray.jpg" },
      { id: "p7",  name: "Salt (1kg)",           price: 2000,  unit: "kg",     image: "salt-1kg.jpg" },
      { id: "p8",  name: "Soap (Bar)",           price: 5500,  unit: "bar",    image: "soap-bar.jpg" },
      { id: "p9",  name: "Toilet Paper (Roll)",  price: 1500,  unit: "roll",   image: "toilet-paper-roll.jpg" },
      { id: "p10", name: "Soda (500ml)",         price: 2000,  unit: "bottle", image: "soda-500ml.jpg" },
      { id: "p11", name: "Maize Flour (2kg)",    price: 7000,  unit: "bag",    image: "maize-flour-2kg.jpg" },
      { id: "p12", name: "Beans (1kg)",          price: 5500,  unit: "kg",     image: "beans-1kg.jpg" }
    ];

    let cart = JSON.parse(localStorage.getItem("beavertail_cart") || "{}");

    // Elements
    const grid = document.getElementById("productGrid");
    const totalText = document.getElementById("totalText");
    const itemsBadge = document.getElementById("itemsBadge");
    const resetCartBtn = document.getElementById("resetCart");
    const nextBtn = document.getElementById("nextBtn");

    // Theme
    const themeToggle = document.getElementById("themeToggle");
    const themeLabel = document.getElementById("themeLabel");

    // Search modal
    const openSearchBtn = document.getElementById("openSearch");
    const searchModal = document.getElementById("searchModal");
    const closeSearchBtn = document.getElementById("closeSearch");
    const doneSearchBtn = document.getElementById("doneSearch");
    const searchInputModal = document.getElementById("searchInputModal");

    // NEW: Cart editor modal
    const editCartBtn = document.getElementById("editCartBtn");
    const cartModal = document.getElementById("cartModal");
    const closeCartBtn = document.getElementById("closeCart");
    const okCartBtn = document.getElementById("okCart");
    const cartListEl = document.getElementById("cartList");
    const cartTotalText = document.getElementById("cartTotalText");
    const clearCartInModalBtn = document.getElementById("clearCartInModal");

    // Checkout modal
    const checkoutModal = document.getElementById("checkoutModal");
    const closeCheckoutBtn = document.getElementById("closeCheckout");
    const orderPreview = document.getElementById("orderPreview");
    const waBtn = document.getElementById("waBtn");
    const emailBtn = document.getElementById("emailBtn");

    // Fulfillment controls
    const pickupOpt = document.getElementById("pickupOpt");
    const deliveryOpt = document.getElementById("deliveryOpt");
    const deliveryNote = document.getElementById("deliveryNote");
    const deliveryLabel = document.getElementById("deliveryLabel");
    const locationBox = document.getElementById("locationBox");
    const deliveryLocation = document.getElementById("deliveryLocation");

    // Theme
    function applyTheme(theme){
      document.documentElement.setAttribute("data-theme", theme);
      themeLabel.textContent = (theme === "dark") ? "🌙" : "☀️";
      localStorage.setItem("beavertail_theme", theme);
    }
    (function initTheme(){
      const saved = localStorage.getItem("beavertail_theme");
      if(saved) applyTheme(saved);
      else{
        const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        applyTheme(prefersDark ? "dark" : "light");
      }
    })();
    function toggleTheme(){
      const current = document.documentElement.getAttribute("data-theme") || "light";
      applyTheme(current === "dark" ? "light" : "dark");
    }
    themeToggle.addEventListener("click", toggleTheme);
    themeToggle.addEventListener("keydown", (e) => {
      if(e.key === "Enter" || e.key === " "){
        e.preventDefault(); toggleTheme();
      }
    });

    // Helpers
    function formatUGX(n){ return new Intl.NumberFormat("en-UG").format(n); }
    function saveCart(){ localStorage.setItem("beavertail_cart", JSON.stringify(cart)); }
    function getQty(id){ return Number(cart[id] || 0); }

    function setQty(id, qty){
      qty = Number.isFinite(qty) ? Math.max(0, Math.floor(qty)) : 0;

      if(qty <= 0) delete cart[id];
      else cart[id] = qty;

      saveCart();
      renderTotals();

      const el = document.querySelector(`[data-qty="${id}"]`);
      if(el) el.textContent = getQty(id);

      const card = document.querySelector(`[data-card="${id}"]`);
      if(card) card.classList.toggle("selected", getQty(id) > 0);

      // If cart editor is open, keep it in sync
      if(cartModal.style.display === "flex"){
        renderCartEditor();
      }

      refreshCheckoutMessage();
    }

    function computeTotals(){
      let subtotal = 0, totalItems = 0;
      for(const p of products){
        const q = getQty(p.id);
        if(q > 0){
          subtotal += p.price * q;
          totalItems += q;
        }
      }
      return { subtotal, total: subtotal, totalItems };
    }

    function renderTotals(){
      const { total, totalItems } = computeTotals();
      totalText.textContent = `UGX ${formatUGX(total)}`;
      itemsBadge.textContent = `${totalItems} item${totalItems===1?"":"s"}`;
      nextBtn.disabled = (totalItems === 0);
    }

    // Cards
    function productCard(p){
      const qty = getQty(p.id);

      const card = document.createElement("div");
      card.className = "card" + (qty > 0 ? " selected" : "");
      card.setAttribute("data-card", p.id);

      const imgbox = document.createElement("div");
      imgbox.className = "imgbox";

      const img = document.createElement("img");
      img.alt = p.name;
      img.src = `images/${p.image}`;
      img.onerror = () => { img.style.display = "none"; }; // keep blank photo area
      imgbox.appendChild(img);

      const content = document.createElement("div");
      content.className = "content";

      const top = document.createElement("div");
      top.className = "row";

      const left = document.createElement("div");
      const nm = document.createElement("div");
      nm.className = "name";
      nm.textContent = p.name;

      const meta = document.createElement("div");
      meta.className = "meta";
      meta.textContent = `Per ${p.unit}`;

      left.appendChild(nm);
      left.appendChild(meta);

      const pr = document.createElement("div");
      pr.className = "price";
      pr.textContent = `${formatUGX(p.price)}`;

      top.appendChild(left);
      top.appendChild(pr);

      content.appendChild(top);

      // Big corner buttons + quantity (no "Add")
      const minus = document.createElement("button");
      minus.className = "cornerBtn minusBtn";
      minus.textContent = "−";
      minus.title = "Reduce quantity";
      minus.onclick = () => setQty(p.id, getQty(p.id) - 1);

      const plus = document.createElement("button");
      plus.className = "cornerBtn plusBtn";
      plus.textContent = "+";
      plus.title = "Increase quantity";
      plus.onclick = () => setQty(p.id, getQty(p.id) + 1);

      const qBadge = document.createElement("div");
      qBadge.className = "qtyNumber";
      qBadge.setAttribute("data-qty", p.id);
      qBadge.textContent = qty;

      card.appendChild(imgbox);
      card.appendChild(content);
      card.appendChild(minus);
      card.appendChild(plus);
      card.appendChild(qBadge);

      return card;
    }

    function renderProducts(filterText=""){
      grid.innerHTML = "";
      const q = (filterText || "").trim().toLowerCase();
      products
        .filter(p => !q || p.name.toLowerCase().includes(q))
        .forEach(p => grid.appendChild(productCard(p)));
    }

    // Search modal
    function openSearch(){
      searchModal.style.display = "flex";
      searchInputModal.value = "";
      renderProducts("");
      setTimeout(() => searchInputModal.focus(), 0);
    }
    function closeSearch(){ searchModal.style.display = "none"; }

    // NEW: Cart editor modal
    function openCartEditor(){
      cartModal.style.display = "flex";
      renderCartEditor();
    }
    function closeCartEditor(){ cartModal.style.display = "none"; }

    function renderCartEditor(){
      cartListEl.innerHTML = "";

      const picked = products.filter(p => getQty(p.id) > 0);

      if(picked.length === 0){
        const empty = document.createElement("div");
        empty.style.padding = "14px";
        empty.style.color = "var(--muted)";
        empty.style.textAlign = "center";
        empty.textContent = "Your cart is empty. Add items on the main page.";
        cartListEl.appendChild(empty);
        cartTotalText.textContent = "UGX 0";
        return;
      }

      for(const p of picked){
        const row = document.createElement("div");
        row.className = "cartRow";

        const left = document.createElement("div");
        left.className = "cartLeft";

        const nm = document.createElement("div");
        nm.className = "cartName";
        nm.textContent = p.name;

        const meta = document.createElement("div");
        meta.className = "cartMeta";
        meta.textContent = `UGX ${formatUGX(p.price)} per ${p.unit}`;

        left.appendChild(nm);
        left.appendChild(meta);

        const controls = document.createElement("div");
        controls.className = "cartControls";

        const minus = document.createElement("button");
        minus.className = "miniBtn";
        minus.textContent = "−";
        minus.title = "Reduce quantity";
        minus.onclick = () => setQty(p.id, getQty(p.id) - 1);

        const input = document.createElement("input");
        input.className = "qtyInput";
        input.type = "number";
        input.min = "0";
        input.step = "1";
        input.value = String(getQty(p.id));
        input.setAttribute("inputmode", "numeric");
        input.setAttribute("aria-label", `Quantity for ${p.name}`);

        input.addEventListener("change", () => {
          const val = parseInt(input.value || "0", 10);
          setQty(p.id, Number.isFinite(val) ? val : 0);
        });

        const plus = document.createElement("button");
        plus.className = "miniBtn";
        plus.textContent = "+";
        plus.title = "Increase quantity";
        plus.onclick = () => setQty(p.id, getQty(p.id) + 1);

        controls.appendChild(minus);
        controls.appendChild(input);
        controls.appendChild(plus);

        row.appendChild(left);
        row.appendChild(controls);

        cartListEl.appendChild(row);
      }

      const { total } = computeTotals();
      cartTotalText.textContent = `UGX ${formatUGX(total)}`;
    }

    // Checkout: fulfillment + message
    function getFulfillmentDetails(subtotal){
      const eligibleDelivery = subtotal > DELIVERY_THRESHOLD;

      let mode = pickupOpt.checked ? "Pickup" : "Delivery";
      if(mode === "Delivery" && !eligibleDelivery){
        mode = "Pickup";
      }

      const location = (deliveryLocation.value || "").trim();
      return { eligibleDelivery, mode, location };
    }

    function syncFulfillmentUI(){
      const { subtotal } = computeTotals();
      const eligibleDelivery = subtotal > DELIVERY_THRESHOLD;

      deliveryOpt.disabled = !eligibleDelivery;
      deliveryLabel.style.opacity = eligibleDelivery ? "1" : ".55";
      deliveryLabel.style.cursor = eligibleDelivery ? "pointer" : "not-allowed";

      if(!eligibleDelivery){
        deliveryNote.textContent = `Delivery is available only when your shopping is above UGX ${formatUGX(DELIVERY_THRESHOLD)}.`;
        pickupOpt.checked = true;
      } else {
        deliveryNote.textContent = `Delivery is available for orders above UGX ${formatUGX(DELIVERY_THRESHOLD)}.`;
      }

      const isDelivery = deliveryOpt.checked && eligibleDelivery;
      locationBox.style.display = isDelivery ? "flex" : "none";

      refreshCheckoutMessage();
    }

    function buildOrderMessage(){
      const lines = [];
      lines.push("*Beavertail Mini-Mart Order*");
      lines.push("--------------------------------");

      let subtotal = 0;
      for(const p of products){
        const q = getQty(p.id);
        if(q > 0){
          const lineTotal = p.price * q;
          subtotal += lineTotal;
          lines.push(`${p.name}  x${q}  = UGX ${formatUGX(lineTotal)}`);
        }
      }

      lines.push("--------------------------------");
      lines.push(`*Subtotal: UGX ${formatUGX(subtotal)}*`);
      lines.push(`*TOTAL: UGX ${formatUGX(subtotal)}*`);
      lines.push("--------------------------------");

      const { eligibleDelivery, mode, location } = getFulfillmentDetails(subtotal);

      if(mode === "Delivery" && eligibleDelivery){
        lines.push(`Fulfillment: DELIVERY`);
        lines.push(`Location: ${location ? location : "(not provided)"}`);
      } else {
        lines.push(`Fulfillment: PICKUP`);
      }

      lines.push("--------------------------------");
      lines.push("Include more details in your message e.g., specific choices, preferred time");

      return { msg: lines.join("\n"), subtotal };
    }

    function refreshCheckoutMessage(){
      if(checkoutModal.style.display !== "flex") return;

      const { msg } = buildOrderMessage();
      orderPreview.innerHTML = msg.replace(/\*(.*?)\*/g, "<strong>$1</strong>");

      waBtn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
      emailBtn.href = `mailto:${EMAIL_TO}?subject=${encodeURIComponent("Beavertail Mini-mart Order")}&body=${encodeURIComponent(msg)}`;
    }

    function openCheckout(){
      const { totalItems } = computeTotals();
      if(totalItems === 0) return;

      pickupOpt.checked = true;
      deliveryLocation.value = "";

      checkoutModal.style.display = "flex";
      syncFulfillmentUI();
    }
    function closeCheckout(){ checkoutModal.style.display = "none"; }

    // Events
    openSearchBtn.addEventListener("click", openSearch);
    closeSearchBtn.addEventListener("click", closeSearch);
    doneSearchBtn.addEventListener("click", closeSearch);
    searchModal.addEventListener("click", (e) => { if(e.target === searchModal) closeSearch(); });

    searchInputModal.addEventListener("input", (e) => renderProducts(e.target.value));

    // NEW: Cart editor events
    editCartBtn.addEventListener("click", openCartEditor);
    closeCartBtn.addEventListener("click", closeCartEditor);
    okCartBtn.addEventListener("click", closeCartEditor);
    cartModal.addEventListener("click", (e) => { if(e.target === cartModal) closeCartEditor(); });

    clearCartInModalBtn.addEventListener("click", () => {
      cart = {};
      saveCart();
      renderTotals();
      renderCartEditor();    // keep modal updated
      refreshCheckoutMessage();

      // also refresh visible cards if any
      renderProducts(searchInputModal.value || "");
    });

    resetCartBtn.addEventListener("click", () => {
      cart = {};
      saveCart();

      searchInputModal.value = "";
      closeSearch();
      closeCartEditor();
      renderProducts("");

      renderTotals();
    });

    nextBtn.addEventListener("click", openCheckout);
    closeCheckoutBtn.addEventListener("click", closeCheckout);
    checkoutModal.addEventListener("click", (e) => { if(e.target === checkoutModal) closeCheckout(); });

    pickupOpt.addEventListener("change", syncFulfillmentUI);
    deliveryOpt.addEventListener("change", syncFulfillmentUI);
    deliveryLocation.addEventListener("input", refreshCheckoutMessage);

    // Init
    renderProducts("");
    renderTotals();
  </script>
