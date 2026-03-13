/* ========================================
   CART.JS - FUNCIONES DEL CARRITO
   ======================================== */

// Agrupar productos por productId y presentación
function groupCartItems() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const grouped = {};
  
  cart.forEach(item => {
    const key = `${item.productId}-${item.presentation}`;
    if (!grouped[key]) {
      grouped[key] = {
        ...item,
        quantity: 0
      };
    }
    grouped[key].quantity++;
  });
  
  return Object.values(grouped);
}

// Cargar y mostrar carrito
function loadCart() {
  const groupedItems = groupCartItems();
  const cartContent = document.getElementById('cartContent');
  
  if (groupedItems.length === 0) {
    cartContent.innerHTML = `
      <div class="empty-cart">
        <div class="empty-cart-icon"><svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M4 4h2.5l3.2 13.5h11.6l2.7-9H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="13" cy="23" r="1.5" fill="currentColor"/><circle cx="20" cy="23" r="1.5" fill="currentColor"/></svg></div><div class="empty-cart-divider"><span></span><i>✦</i><span></span></div>
        <h2>Tu cotización está <em>vacía</em></h2>
        <p>Aún no has agregado productos. Explora nuestro catálogo y encuentra lo que necesitas.</p>
        <a href="catalog.html" class="btn btn-primary">Explorar catálogo</a>
      </div>
    `;
    return;
  }

  // Calcular total
  const total = groupedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = groupedItems.reduce((sum, item) => sum + item.quantity, 0);

  // Mostrar carrito
  cartContent.innerHTML = `
    <div class="cart-content">
      <div class="cart-items">
        ${groupedItems.map((item, idx) => `
          <div class="cart-item" id="item-${idx}">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
              <h3>${item.name}</h3>
              <p class="product-type">${item.category ? item.category.toUpperCase() : 'PRODUCTO'}</p>
              <p style="font-size: 0.9rem; color: var(--gray);">Presentación: <strong>${item.presentation || 'Estándar'}</strong></p>
              <div class="cart-item-price">S/. ${parseFloat(item.price).toFixed(2)} c/u</div>
            </div>
            <div class="cart-item-actions">
              <div style="text-align: right; display: flex; flex-direction: column; gap: 0.5rem;">
                <div style="font-size: 0.9rem; color: var(--gray);">Subtotal</div>
                <div style="font-size: 1.2rem; font-weight: 700; color: var(--primary);">S/. ${(item.price * item.quantity).toFixed(2)}</div>
              </div>
              <div class="qty-controls">
                <button class="qty-btn-cart" onclick="updateQuantity(${item.productId}, '${item.presentation}', -1)">−</button>
                <div class="qty-display-cart">${item.quantity}</div>
                <button class="qty-btn-cart" onclick="updateQuantity(${item.productId}, '${item.presentation}', 1)">+</button>
              </div>
              <button class="remove-btn" onclick="removeFromCart(${item.productId}, '${item.presentation}')">Eliminar</button>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="cart-summary">
        <div class="summary-title">Resume tu Orden</div>
        <div class="summary-row">
          <span>Subtotal</span>
          <span>S/. ${total.toFixed(2)}</span>
        </div>
        <div class="summary-row">
          <span>Ítems</span>
          <span>${totalItems}</span>
        </div>
        <div class="summary-row">
          <span>Envío</span>
          <span>Calculado al checkout</span>
        </div>
        <div class="summary-row total">
          <span>Total</span>
          <span>S/. ${total.toFixed(2)}</span>
        </div>
        <button class="checkout-btn" onclick="checkout()">Proceder al Pago</button>
        <button class="continue-shopping" onclick="window.location.href='catalog.html'">Continuar Comprando</button>
      </div>
    </div>
  `;
}

function updateQuantity(productId, presentation, change) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Contar cuántos items hay de este producto y presentación
  const itemsOfType = cart.filter(item => 
    item.productId === productId && item.presentation === presentation
  );
  
  const currentQty = itemsOfType.length;
  const newQty = currentQty + change;
  
  if (newQty <= 0) {
    // Eliminar todos si la cantidad es 0 o menos
    cart = cart.filter(item => 
      !(item.productId === productId && item.presentation === presentation)
    );
  } else if (change > 0) {
    // Agregar uno más
    const template = itemsOfType[0];
    cart.push({ ...template });
  } else {
    // Quitar uno
    const indexToRemove = cart.findIndex(item => 
      item.productId === productId && item.presentation === presentation
    );
    if (indexToRemove !== -1) {
      cart.splice(indexToRemove, 1);
    }
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
  loadCart();
}

function removeFromCart(productId, presentation) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart = cart.filter(item => 
    !(item.productId === productId && item.presentation === presentation)
  );
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
  loadCart();
}

/* ═══════════════════════════════════════
   CHECKOUT MODAL
═══════════════════════════════════════ */

const CHECKOUT_STORAGE_KEY = 'rosesCheckoutData';

function checkout() {
  const groupedItems = groupCartItems();
  if (groupedItems.length === 0) {
    toast.warning('Tu carrito está vacío');
    return;
  }
  openCheckoutModal(groupedItems);
}

function openCheckoutModal(groupedItems) {
  const overlay = document.getElementById('checkoutOverlay');
  if (!overlay) return;

  // Renderizar resumen de productos
  const total = groupedItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const summaryEl = document.getElementById('checkoutSummary');
  summaryEl.innerHTML = groupedItems.map(i => `
    <div class="checkout-summary-item">
      <strong>${i.name} <em style="font-weight:400;font-style:normal;color:var(--text-muted);">(${i.presentation}) ×${i.quantity}</em></strong>
      <span>S/ ${(i.price * i.quantity).toFixed(2)}</span>
    </div>
  `).join('') + `
    <div class="checkout-summary-item" style="margin-top:.5rem;padding-top:.5rem;border-top:1px solid var(--border-light);">
      <strong>Total</strong>
      <span style="font-size:1.1rem;">S/ ${total.toFixed(2)}</span>
    </div>`;

  document.getElementById('checkoutTotal').textContent = `S/ ${total.toFixed(2)}`;

  // Pre-llenar con datos guardados
  const saved = JSON.parse(localStorage.getItem(CHECKOUT_STORAGE_KEY) || '{}');
  if (saved.name)    document.getElementById('co-name').value    = saved.name;
  if (saved.dni)     document.getElementById('co-dni').value     = saved.dni;
  if (saved.email)   document.getElementById('co-email').value   = saved.email;
  if (saved.phone)   document.getElementById('co-phone').value   = saved.phone;
  if (saved.address) document.getElementById('co-address').value = saved.address;
  if (saved.notes)   document.getElementById('co-notes').value   = saved.notes;

  // Limpiar errores previos
  ['name','dni','email','phone','address'].forEach(f => {
    document.getElementById(`err-${f}`).textContent = '';
    document.getElementById(`co-${f}`).classList.remove('invalid');
  });

  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('co-name').focus(), 100);
}

function closeCheckoutModal() {
  document.getElementById('checkoutOverlay')?.classList.remove('active');
  document.body.style.overflow = '';
}

function validateCheckoutForm() {
  let valid = true;

  const fields = [
    { id: 'name',    label: 'Nombre',   fn: v => v.trim().length >= 2 },
    { id: 'dni',     label: 'DNI',      fn: v => /^\d{8}$/.test(v.trim()) },
    { id: 'email',   label: 'Email',    fn: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) },
    { id: 'phone',   label: 'Teléfono', fn: v => v.trim().length >= 7 },
    { id: 'address', label: 'Dirección',fn: v => v.trim().length >= 5 },
  ];

  const messages = {
    name:    'Ingresa tu nombre completo',
    dni:     'DNI debe tener 8 dígitos',
    email:   'Correo no válido',
    phone:   'Teléfono no válido',
    address: 'Ingresa tu dirección',
  };

  fields.forEach(({ id, fn }) => {
    const input = document.getElementById(`co-${id}`);
    const errEl = document.getElementById(`err-${id}`);
    if (!fn(input.value)) {
      errEl.textContent = messages[id];
      input.classList.add('invalid');
      valid = false;
    } else {
      errEl.textContent = '';
      input.classList.remove('invalid');
    }
  });

  return valid;
}

function submitCheckout(e) {
  e.preventDefault();
  if (!validateCheckoutForm()) return;

  const name    = document.getElementById('co-name').value.trim();
  const dni     = document.getElementById('co-dni').value.trim();
  const email   = document.getElementById('co-email').value.trim();
  const phone   = document.getElementById('co-phone').value.trim();
  const address = document.getElementById('co-address').value.trim();
  const notes   = document.getElementById('co-notes').value.trim();
  const remember = document.getElementById('co-remember').checked;

  // Guardar si el usuario lo pidió
  if (remember) {
    localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify({ name, dni, email, phone, address, notes }));
  } else {
    localStorage.removeItem(CHECKOUT_STORAGE_KEY);
  }

  // Construir mensaje WhatsApp
  const groupedItems = groupCartItems();
  const total = groupedItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);

  let message = `🌿 *Pedido - Roses Bienestar*\n\n`;
  message += `👤 *Cliente:* ${name}\n`;
  message += `🪪 *DNI:* ${dni}\n`;
  message += `📧 *Email:* ${email}\n`;
  message += `📱 *Teléfono:* ${phone}\n`;
  message += `📍 *Dirección:* ${address}\n`;
  if (notes) message += `📝 *Notas:* ${notes}\n`;
  message += `\n*Productos:*\n`;
  groupedItems.forEach(i => {
    message += `• ${i.name} (${i.presentation}) ×${i.quantity} — S/ ${(i.price * i.quantity).toFixed(2)}\n`;
  });
  message += `\n💰 *Total: S/ ${total.toFixed(2)}*\n\nPor favor confirma disponibilidad y método de pago.`;

  // ── Guardar en el CRM (localStorage del admin) ──
  saveOrderToAdmin({ name, dni, email, phone, address, notes }, groupedItems, total);

  closeCheckoutModal();
  window.open('https://wa.me/51990502491?text=' + encodeURIComponent(message), '_blank');
}

function saveOrderToAdmin(clientData, items, total) {
  // 1. Guardar o reutilizar cliente
  const clients = JSON.parse(localStorage.getItem('rosesClients') || '[]');
  let client = clients.find(c => c.dni === clientData.dni || c.email === clientData.email);

  if (!client) {
    const newId = clients.length > 0 ? Math.max(...clients.map(c => c.id || 0)) + 1 : 1;
    client = {
      id:        newId,
      name:      clientData.name,
      dni:       clientData.dni,
      email:     clientData.email,
      phone:     clientData.phone,
      address:   clientData.address,
      status:    'activo',
      notes:     clientData.notes || '',
      dateAdded: new Date().toISOString().split('T')[0],
    };
    clients.push(client);
    localStorage.setItem('rosesClients', JSON.stringify(clients));
  }

  // 2. Crear la venta
  const sales  = JSON.parse(localStorage.getItem('rosesSales') || '[]');
  const nextId = sales.length > 0 ? Math.max(...sales.map(s => s.id || 0)) + 1 : 1;
  const prefix = (() => {
    try { return JSON.parse(localStorage.getItem('rosesSettings') || '{}').invPrefix || 'INV-'; } catch(e) { return 'INV-'; }
  })();

  const sale = {
    id:         nextId,
    invoice:    `${prefix}${String(nextId).padStart(3, '0')}`,
    clientId:   client.id,
    clientName: client.name,
    date:       new Date().toISOString().split('T')[0],
    status:     'pendiente',
    notes:      clientData.notes || '',
    items: items.map(i => ({
      name:         i.name,
      presentation: i.presentation || '',
      qty:          i.quantity,
      price:        parseFloat(i.price),
    })),
    total,
  };

  sales.push(sale);
  localStorage.setItem('rosesSales', JSON.stringify(sales));
}

function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const badge = document.getElementById('cartBadge');
  if (badge) {
    badge.textContent = cart.length;
  }
}

/* ========================================
   INICIALIZACIÓN
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  loadCart();

  // Mobile menu
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');
  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      nav.classList.toggle('active');
    });

    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        nav.classList.remove('active');
      });
    });
  }

  // Header scroll
  const header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // Button cart redirection
  const cartBtn = document.getElementById('cartBtn');
  if (cartBtn) {
    cartBtn.addEventListener('click', () => {
      window.location.href = 'cart.html';
    });
  }

  // Checkout modal listeners
  document.getElementById('checkoutClose')?.addEventListener('click', closeCheckoutModal);
  document.getElementById('checkoutOverlay')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) closeCheckoutModal();
  });
  document.getElementById('checkoutForm')?.addEventListener('submit', submitCheckout);

  // Cerrar con Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeCheckoutModal();
  });
});