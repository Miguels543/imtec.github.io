/* ========================================
   PRODUCTS.JS - IMTEC PIURA
   Import & Tecnología EIRL
   Tóner, Tintas y Consumibles de Impresión
   ======================================== */

const defaultProducts = [
  {
    id: 1,
    name: 'Tóner Compatible IMTEC - HP 85A',
    category: 'toner-laser',
    image: 'https://img.freepik.com/free-photo/close-up-printer-toner_23-2149287479.jpg?t=st=1773382355~exp=1773385955~hmac=561af181296b04738bd8c6304d18a31692c34bcc087bc778bb21585954516f17&w=1060',
    description: 'Tóner compatible marca IMTEC para impresoras HP LaserJet P1102, P1102W, M1130, M1132, M1212, M1217. Alto rendimiento, excelente calidad de impresión. Marca propia importada con garantía de calidad.',
    presentations: [
      { name: 'Estándar (~1,600 pág.)', price: 55.00 },
      { name: 'Alta capacidad (~2,200 pág.)', price: 75.00 }
    ],
    stock: 40,
    bestSelling: true,
    dateAdded: new Date('2025-01-10')
  },
  {
    id: 2,
    name: 'Tóner Compatible IMTEC - HP 78A',
    category: 'toner-laser',
    image: 'https://img.freepik.com/premium-photo/close-up-printer-toner_23-2149287483.jpg?w=1060',
    description: 'Tóner compatible marca IMTEC para HP LaserJet P1560, P1566, P1606, M1536. Rendimiento superior, tinta de calidad que garantiza impresiones nítidas y profesionales.',
    presentations: [
      { name: 'Estándar (~2,100 pág.)', price: 60.00 },
      { name: 'Alta capacidad (~3,000 pág.)', price: 82.00 }
    ],
    stock: 35,
    bestSelling: true,
    dateAdded: new Date('2025-01-12')
  },
  {
    id: 3,
    name: 'Tóner Compatible IMTEC - HP 12A',
    category: 'toner-laser',
    image: 'https://img.freepik.com/premium-photo/close-up-printer-office-desk-concept-copier-photocopier-workplace-equipment-scanning-paper-copy-document_619210-143.jpg?w=1060',
    description: 'Tóner compatible IMTEC para HP LaserJet 1010, 1012, 1015, 1018, 1020, 1022, 3015, 3020, 3030. Ideal para oficinas con alto volumen de impresión. Económico y rendidor.',
    presentations: [
      { name: 'Estándar (~2,000 pág.)', price: 52.00 }
    ],
    stock: 50,
    bestSelling: true,
    dateAdded: new Date('2025-01-15')
  },
  {
    id: 8,
    name: 'Tinta para Sistema Continuo - Epson',
    category: 'tintas',
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7',
    description: 'Tintas IMTEC de alta calidad para sistemas continuos Epson (L110, L210, L300, L350, L355, L555 y más). Colores vivos y resistentes. Económicas y de excelente rendimiento.',
    presentations: [
      { name: 'Negro 100ml', price: 18.00 },
      { name: 'Color (C/M/Y) 100ml c/u', price: 15.00 },
      { name: 'Kit completo 4 colores', price: 58.00 }
    ],
    stock: 60,
    bestSelling: true,
    dateAdded: new Date('2025-01-05')
  },
  {
    id: 12,
    name: 'Servicio: Reparación de Impresora Láser',
    category: 'servicios',
    image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc',
    description: 'Servicio profesional de diagnóstico, reparación y mantenimiento de impresoras láser HP, Brother, Samsung y Canon. Incluye limpieza interna, revisión de rodillos y fusor. Garantía en el servicio.',
    presentations: [
      { name: 'Diagnóstico + Limpieza', price: 40.00 },
      { name: 'Reparación completa (cotizar)', price: 0.01 }
    ],
    stock: 99,
    bestSelling: false,
    dateAdded: new Date('2025-01-01')
  }
];

// Cargar productos desde localStorage o usar por defecto
let products = [];
function initializeProducts() {
  const saved = localStorage.getItem('imtecProducts');
  if (saved) {
    products = JSON.parse(saved);
  } else {
    products = JSON.parse(JSON.stringify(defaultProducts));
    localStorage.setItem('imtecProducts', JSON.stringify(products));
  }
}

// Variables globales
let currentProduct = {};
let selectedPresentations = {};
let currentGridColumns = 3;

/* ===============================================
   FUNCIONES DEL MODAL
   =============================================== */

function openModal(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  currentProduct = product;
  selectedPresentations = {};
  loadCartSelections();

  document.getElementById('modalTitle').textContent = product.name;
  document.getElementById('modalImage').src = product.image;
  document.getElementById('modalImage').alt = product.name;
  document.getElementById('modalDesc').textContent = product.description;

  const container = document.getElementById('presentationsContainer');
  container.innerHTML = product.presentations.map((pres, idx) => {
    const qty = selectedPresentations[idx] ? selectedPresentations[idx].qty : 0;
    const isSelected = qty > 0;
    const displayPrice = pres.price < 1 ? 'Cotizar' : `S/. ${pres.price.toFixed(2)}`;

    return `
      <div class="presentation-item ${isSelected ? 'selected' : ''}" id="pres-${idx}" onclick="togglePresentation(${idx}, '${pres.name}', ${pres.price})">
        <div class="pres-info">
          <div class="pres-name">${pres.name}</div>
          <div class="pres-price">${displayPrice}</div>
        </div>
        <div class="pres-controls">
          <button class="qty-btn" onclick="event.stopPropagation(); decrementQty(${idx})" ${qty === 0 ? 'disabled' : ''}>−</button>
          <div class="qty-display" id="qty-${idx}">${qty}</div>
          <button class="qty-btn" onclick="event.stopPropagation(); incrementQty(${idx})">+</button>
          ${qty > 0 ? `<button class="remove-pres-btn" onclick="event.stopPropagation(); removePresentation(${idx})">✕</button>` : ''}
        </div>
      </div>
    `;
  }).join('');

  document.getElementById('modalOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
  document.body.style.overflow = 'auto';
}

function loadCartSelections() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  selectedPresentations = {};

  cart.forEach(item => {
    if (item.productId === currentProduct.id) {
      const presIdx = currentProduct.presentations.findIndex(p => p.name === item.presentation);
      if (presIdx !== -1) {
        if (!selectedPresentations[presIdx]) {
          selectedPresentations[presIdx] = { name: item.presentation, price: item.price, qty: 0 };
        }
        selectedPresentations[presIdx].qty++;
      }
    }
  });
}

function togglePresentation(idx, name, price) {
  const currentQty = selectedPresentations[idx] ? selectedPresentations[idx].qty : 0;
  if (currentQty === 0) {
    selectedPresentations[idx] = { name, price, qty: 1 };
  }
  updatePresentationUI(idx);
}

function incrementQty(idx) {
  if (!selectedPresentations[idx]) {
    const pres = currentProduct.presentations[idx];
    selectedPresentations[idx] = { name: pres.name, price: pres.price, qty: 0 };
  }
  selectedPresentations[idx].qty++;
  updatePresentationUI(idx);
}

function decrementQty(idx) {
  if (selectedPresentations[idx] && selectedPresentations[idx].qty > 0) {
    selectedPresentations[idx].qty--;
    if (selectedPresentations[idx].qty === 0) delete selectedPresentations[idx];
    updatePresentationUI(idx);
  }
}

function removePresentation(idx) {
  delete selectedPresentations[idx];
  updatePresentationUI(idx);
}

function updatePresentationUI(idx) {
  const presElement = document.getElementById(`pres-${idx}`);
  const qty = selectedPresentations[idx] ? selectedPresentations[idx].qty : 0;
  const pres = currentProduct.presentations[idx];
  const displayPrice = pres.price < 1 ? 'Cotizar' : `S/. ${pres.price.toFixed(2)}`;

  if (qty > 0) { presElement.classList.add('selected'); }
  else { presElement.classList.remove('selected'); }

  presElement.innerHTML = `
    <div class="pres-info">
      <div class="pres-name">${pres.name}</div>
      <div class="pres-price">${displayPrice}</div>
    </div>
    <div class="pres-controls">
      <button class="qty-btn" onclick="event.stopPropagation(); decrementQty(${idx})" ${qty === 0 ? 'disabled' : ''}>−</button>
      <div class="qty-display" id="qty-${idx}">${qty}</div>
      <button class="qty-btn" onclick="event.stopPropagation(); incrementQty(${idx})">+</button>
      ${qty > 0 ? `<button class="remove-pres-btn" onclick="event.stopPropagation(); removePresentation(${idx})">✕</button>` : ''}
    </div>
  `;
}

function addSelectedToCart() {
  const selectedKeys = Object.keys(selectedPresentations);
  if (selectedKeys.length === 0) {
    toast.warning('Selecciona al menos una opción');
    return;
  }

  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart = cart.filter(item => item.productId !== currentProduct.id);

  selectedKeys.forEach(idx => {
    const pres = selectedPresentations[idx];
    for (let i = 0; i < pres.qty; i++) {
      cart.push({
        productId: currentProduct.id,
        name: currentProduct.name,
        image: currentProduct.image,
        category: currentProduct.category,
        presentation: pres.name,
        price: pres.price
      });
    }
  });

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
  closeModal();
  toast.success('✓ Producto agregado a tu cotización');
}

function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const badge = document.getElementById('cartBadge');
  if (badge) badge.textContent = cart.length;
}

/* ===============================================
   RENDER DE PRODUCTOS
   =============================================== */

function getCategoryLabel(cat) {
  const labels = {
    'toner-laser':           '🖨️ Tóner Láser Compatible',
    'toner-original':        '✅ Tóner Original',
    'tintas':                '🎨 Tintas Sistema Continuo',
    'accesorios-impresion':  '🔧 Accesorios',
    'servicios':             '🛠️ Servicios'
  };
  return labels[cat] || cat;
}

function renderProducts(list) {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  const toRender = list !== undefined ? list : products;

  if (toRender.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
        <div style="font-size:3rem; margin-bottom:1rem;">🔍</div>
        <p>No encontramos productos con esos filtros.</p>
      </div>`;
    return;
  }

  // En index.html solo mostramos los más vendidos (máx. 4)
  const isIndex = !document.querySelector('.catalog-section');
  const productsToShow = isIndex
    ? toRender.filter(p => p.bestSelling).slice(0, 4)
    : toRender;

  grid.innerHTML = productsToShow.map(product => {
    const minPrice = Math.min(...product.presentations.map(p => p.price));
    const hasMultiple = product.presentations.length > 1;
    const priceDisplay = minPrice < 1
      ? '<span style="font-size:.9rem;font-weight:500;color:var(--text-muted);">Precio a cotizar</span>'
      : `${hasMultiple ? '<span class="price-from">Desde </span>' : ''}S/. ${minPrice.toFixed(2)}`;

    return `
      <div class="product-card scroll-reveal" onclick="openModal(${product.id})">
        ${product.bestSelling ? '<span class="product-badge">⭐ Más pedido</span>' : ''}
        <img
          class="product-image"
          src="${product.image}"
          alt="${product.name}"
          loading="lazy"
          onerror="this.src='https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&h=400&fit=crop'"
        >
        <div class="product-info">
          <p class="product-category">${getCategoryLabel(product.category)}</p>
          <h3 class="product-name">${product.name}</h3>
          <p class="product-price">${priceDisplay}</p>
          <div class="product-actions">
            <button class="btn btn-primary" onclick="event.stopPropagation(); openModal(${product.id})">
              Ver opciones
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/* ===============================================
   ORDENAMIENTO
   =============================================== */

function sortProducts(list, type) {
  const sorted = [...list];
  switch (type) {
    case 'best-selling':
      sorted.sort((a, b) => (b.bestSelling ? 1 : 0) - (a.bestSelling ? 1 : 0));
      break;
    case 'alphabetical-asc':
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'alphabetical-desc':
      sorted.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'price-asc':
      sorted.sort((a, b) => Math.min(...a.presentations.map(p => p.price)) - Math.min(...b.presentations.map(p => p.price)));
      break;
    case 'price-desc':
      sorted.sort((a, b) => Math.min(...b.presentations.map(p => p.price)) - Math.min(...a.presentations.map(p => p.price)));
      break;
    case 'date-desc':
      sorted.sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
      break;
    case 'date-asc':
      sorted.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
      break;
  }
  return sorted;
}

/* ===============================================
   FILTRADO
   =============================================== */

function applyFilters() {
  const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
  const minPrice = parseFloat(document.getElementById('minPriceInput')?.value) || 0;
  const maxPrice = parseFloat(document.getElementById('maxPriceInput')?.value) || 9999;
  const categoryFilters = Array.from(document.querySelectorAll('.category-filter:checked')).map(cb => cb.value);
  const sortType = document.getElementById('sortSelect')?.value || '';

  let filtered = products.filter(p => {
    let match = p.name.toLowerCase().includes(search);
    const minProductPrice = Math.min(...p.presentations.map(pr => pr.price));
    match = match && (minProductPrice >= minPrice && minProductPrice <= maxPrice);
    if (categoryFilters.length > 0) match = match && categoryFilters.includes(p.category);
    return match;
  });

  filtered = sortProducts(filtered, sortType || 'best-selling');
  renderProducts(filtered);

  const counter = document.getElementById('productsCount');
  if (counter) counter.textContent = filtered.length;

  updateStockCounts();
}

function updateStockCounts() {
  const inStockCount = document.getElementById('inStockCount');
  const outStockCount = document.getElementById('outStockCount');
  if (inStockCount) inStockCount.textContent = products.length;
  if (outStockCount) outStockCount.textContent = '0';
}

function updateSliderTrack() {
  const minRange = document.getElementById('minPriceRange');
  const maxRange = document.getElementById('maxPriceRange');
  const track = document.getElementById('sliderTrack');
  if (!minRange || !maxRange || !track) return;
  const min = parseInt(minRange.value);
  const max = parseInt(maxRange.value);
  const rangeMin = parseInt(minRange.min);
  const rangeMax = parseInt(minRange.max);
  const percentMin = ((min - rangeMin) / (rangeMax - rangeMin)) * 100;
  const percentMax = ((max - rangeMin) / (rangeMax - rangeMin)) * 100;
  track.style.left = percentMin + '%';
  track.style.width = (percentMax - percentMin) + '%';
}

/* ===============================================
   VISTA GRID
   =============================================== */

function changeGridView(columns) {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  grid.className = `products-grid grid-${columns}`;
  currentGridColumns = columns;
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.classList.remove('active');
    if (parseInt(btn.dataset.columns) === columns) btn.classList.add('active');
  });
}

/* ===============================================
   CARRITO LATERAL
   =============================================== */

function openCart() {
  const sidebar = document.getElementById('cartSidebar');
  if (sidebar) {
    renderCart();
    sidebar.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeCart() {
  const sidebar = document.getElementById('cartSidebar');
  if (sidebar) {
    sidebar.classList.remove('open');
    document.body.style.overflow = 'auto';
  }
}

function renderCart() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const container = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <div style="font-size:2.5rem;margin-bottom:1rem;">🖨️</div>
        <p>Tu cotización está vacía.<br>Agrega productos y solicita tu cotización vía WhatsApp.</p>
      </div>`;
    if (totalEl) totalEl.textContent = 'S/. 0.00';
    return;
  }

  const grouped = {};
  cart.forEach(item => {
    const key = `${item.productId}-${item.presentation}`;
    if (!grouped[key]) grouped[key] = { ...item, qty: 0 };
    grouped[key].qty++;
  });

  container.innerHTML = Object.values(grouped).map(item => `
    <div class="cart-item">
      <img class="cart-item-image" src="${item.image}" alt="${item.name}"
        onerror="this.src='https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=100&h=100&fit=crop'">
      <div class="cart-item-info">
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-pres">${item.presentation} × ${item.qty}</p>
        <p class="cart-item-price">${item.price < 1 ? 'A cotizar' : `S/. ${(item.price * item.qty).toFixed(2)}`}</p>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart('${item.productId}','${item.presentation}')">✕</button>
    </div>
  `).join('');

  const total = Object.values(grouped).reduce((sum, i) => sum + (i.price >= 1 ? i.price * i.qty : 0), 0);
  if (totalEl) totalEl.textContent = `S/. ${total.toFixed(2)}`;

  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.onclick = () => { window.location.href = 'cart.html'; };
  }
}

function removeFromCart(productId, presentation) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const idx = cart.findIndex(i => i.productId == productId && i.presentation === presentation);
  if (idx > -1) cart.splice(idx, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
  renderCart();
}

function sendCartWhatsApp() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  if (cart.length === 0) {
    toast.warning('Tu cotización está vacía');
    return;
  }

  const grouped = {};
  cart.forEach(item => {
    const key = `${item.productId}-${item.presentation}`;
    if (!grouped[key]) grouped[key] = { ...item, qty: 0 };
    grouped[key].qty++;
  });

  const lines = Object.values(grouped).map(i => {
    const priceStr = i.price < 1 ? '(cotizar)' : `→ S/. ${(i.price * i.qty).toFixed(2)}`;
    return `• ${i.name} | ${i.presentation} × ${i.qty} ${priceStr}`;
  }).join('\n');

  const total = Object.values(grouped).reduce((sum, i) => sum + (i.price >= 1 ? i.price * i.qty : 0), 0);
  const totalStr = total > 0 ? `\nTotal referencial: S/. ${total.toFixed(2)}` : '';

  const msg = `Hola IMTEC Piura, quisiera solicitar cotización de los siguientes productos:\n\n${lines}${totalStr}\n\n¿Tienen disponibilidad? Gracias.`;
  window.open(`https://wa.me/51969981040?text=${encodeURIComponent(msg)}`, '_blank');
}

/* ===============================================
   EVENT LISTENERS
   =============================================== */

function setupFilterListeners() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.addEventListener('input', applyFilters);

  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) sortSelect.addEventListener('change', applyFilters);

  const inStockFilter = document.getElementById('inStockFilter');
  const outOfStockFilter = document.getElementById('outOfStockFilter');
  if (inStockFilter) inStockFilter.addEventListener('change', applyFilters);
  if (outOfStockFilter) outOfStockFilter.addEventListener('change', applyFilters);

  const minPriceRange = document.getElementById('minPriceRange');
  const maxPriceRange = document.getElementById('maxPriceRange');
  const minPriceInput = document.getElementById('minPriceInput');
  const maxPriceInput = document.getElementById('maxPriceInput');

  if (minPriceRange && minPriceInput) {
    minPriceRange.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      const maxValue = parseInt(maxPriceRange.value);
      if (value > maxValue) { minPriceRange.value = maxValue; minPriceInput.value = maxValue; }
      else { minPriceInput.value = value; }
      updateSliderTrack();
    });
    minPriceRange.addEventListener('change', applyFilters);
    minPriceInput.addEventListener('input', (e) => {
      minPriceRange.value = parseInt(e.target.value) || 0;
      updateSliderTrack();
      applyFilters();
    });
  }

  if (maxPriceRange && maxPriceInput) {
    maxPriceRange.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      const minValue = parseInt(minPriceRange.value);
      if (value < minValue) { maxPriceRange.value = minValue; maxPriceInput.value = minValue; }
      else { maxPriceInput.value = value; }
      updateSliderTrack();
    });
    maxPriceRange.addEventListener('change', applyFilters);
    maxPriceInput.addEventListener('input', (e) => {
      maxPriceRange.value = parseInt(e.target.value) || 9999;
      updateSliderTrack();
      applyFilters();
    });
  }

  document.querySelectorAll('.category-filter').forEach(f => f.addEventListener('change', applyFilters));

  const clearBtn = document.getElementById('clearFilters');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (sortSelect) sortSelect.value = '';
      if (inStockFilter) inStockFilter.checked = true;
      if (outOfStockFilter) outOfStockFilter.checked = false;
      if (minPriceInput) minPriceInput.value = '0';
      if (maxPriceInput) maxPriceInput.value = '9999';
      if (minPriceRange) minPriceRange.value = '0';
      if (maxPriceRange) maxPriceRange.value = '9999';
      document.querySelectorAll('.category-filter').forEach(f => f.checked = false);
      updateSliderTrack();
      applyFilters();
    });
  }

  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => changeGridView(parseInt(btn.dataset.columns)));
  });

  updateSliderTrack();
}

/* ===============================================
   INICIALIZACIÓN
   =============================================== */

document.addEventListener('DOMContentLoaded', () => {
  initializeProducts();
  updateCartBadge();
  updateStockCounts();

  if (document.getElementById('productsGrid')) {
    renderProducts();
    setupFilterListeners();
    const counter = document.getElementById('productsCount');
    if (counter) counter.textContent = products.length;
  }

  const cartBtn = document.getElementById('cartBtn');
  if (cartBtn) cartBtn.addEventListener('click', openCart);

  const cartClose = document.getElementById('cartClose');
  if (cartClose) cartClose.addEventListener('click', closeCart);
});