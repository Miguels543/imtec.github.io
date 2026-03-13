/* ═══════════════════════════════════════════
   IMTEC ADMIN — admin.js
   Gestión de productos y categorías
═══════════════════════════════════════════ */

let currentEditingProduct = null;
let allProducts = [];

const DEFAULT_CATEGORIES = [
  { value: 'toner_laser',   label: 'Tóner Láser' },
  { value: 'toner_inkjet',  label: 'Tóner Inkjet' },
  { value: 'tintas',        label: 'Tintas Sistema Continuo' },
  { value: 'drum',          label: 'Drum / Fotoconductor' },
  { value: 'impresoras',    label: 'Impresoras' },
  { value: 'accesorios',    label: 'Accesorios y Repuestos' },
];
let allCategories = [];

/* ─── TOAST ─── */
const toast = {
  _show(msg, type='') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    const el = document.createElement('div');
    el.className = `toast ${type ? 'toast-'+type : ''}`;
    el.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${type==='error' ? '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>' :
          type==='warning' ? '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>' :
          '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'}
      </svg>
      ${escHtml(String(msg))}
    `;
    container.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => el.remove(), 400);
    }, 3200);
  },
  success: (m) => toast._show(m, ''),
  error:   (m) => toast._show(m, 'error'),
  warning: (m) => toast._show(m, 'warning'),
  info:    (m) => toast._show(m, 'info'),
};

function showToast(msg, isError=false) {
  if (isError) toast.error(msg);
  else toast.success(msg);
}

/* ─── CONFIRM DIALOG ─── */
function showConfirm(message, onConfirm) {
  document.getElementById('_imtecConfirm')?.remove();
  const overlay = document.createElement('div');
  overlay.id = '_imtecConfirm';
  overlay.style.cssText = `position:fixed;inset:0;z-index:99998;background:rgba(0,0,0,.5);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;animation:_fadeIn .2s ease;`;
  overlay.innerHTML = `
    <div style="background:#fff;max-width:400px;width:90%;border-top:3px solid #dc2626;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.2);font-family:'DM Sans',system-ui,sans-serif;overflow:hidden;">
      <div style="padding:1.5rem 1.5rem 1rem;display:flex;gap:.875rem;align-items:flex-start;">
        <div style="width:36px;height:36px;border-radius:50%;background:rgba(220,38,38,.1);color:#dc2626;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
        <div>
          <p style="font-size:.7rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#aaa;margin:0 0 .35rem;">Confirmar acción</p>
          <p style="font-size:.9rem;color:#333;margin:0;line-height:1.55;">${message}</p>
        </div>
      </div>
      <div style="padding:.75rem 1.5rem 1.25rem;display:flex;gap:.625rem;justify-content:flex-end;">
        <button id="_cfmCancel" style="padding:.55rem 1.25rem;border:1.5px solid #e5e7eb;background:none;border-radius:6px;font-family:inherit;font-size:.8rem;font-weight:600;cursor:pointer;color:#666;transition:all .2s;">Cancelar</button>
        <button id="_cfmOk" style="padding:.55rem 1.25rem;border:none;background:#dc2626;color:#fff;border-radius:6px;font-family:inherit;font-size:.8rem;font-weight:600;cursor:pointer;transition:all .2s;">Eliminar</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  if (!document.getElementById('_cfmStyle')) {
    const s = document.createElement('style');
    s.id = '_cfmStyle';
    s.textContent = '@keyframes _fadeIn{from{opacity:0}to{opacity:1}}';
    document.head.appendChild(s);
  }
  const close = () => { overlay.style.opacity='0'; overlay.style.transition='opacity .2s'; setTimeout(()=>overlay.remove(),220); };
  overlay.querySelector('#_cfmCancel').onclick = close;
  overlay.querySelector('#_cfmOk').onclick = () => { close(); onConfirm(); };
  overlay.onclick = e => { if (e.target===overlay) close(); };
  document.addEventListener('keydown', function esc(e){ if(e.key==='Escape'){close();document.removeEventListener('keydown',esc);} });
}

/* ─── CATEGORÍAS ─── */
function loadCategories() {
  const saved = localStorage.getItem('imtecCategories');
  if (saved) {
    allCategories = JSON.parse(saved);
    DEFAULT_CATEGORIES.forEach(def => {
      if (!allCategories.find(c => c.value === def.value))
        allCategories.unshift({ ...def, custom: false });
    });
  } else {
    allCategories = DEFAULT_CATEGORIES.map(c => ({ ...c, custom: false }));
  }
  saveCategories();
}

function saveCategories() {
  localStorage.setItem('imtecCategories', JSON.stringify(allCategories));
}

function syncCategorySelects(keepValue='') {
  ['productCategory','filterCategory'].forEach((selId, idx) => {
    const sel = document.getElementById(selId);
    if (!sel) return;
    const current = keepValue || sel.value;
    sel.innerHTML = idx === 0
      ? '<option value="">-- Seleccionar --</option>'
      : '<option value="">Todas las categorías</option>';
    allCategories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.value;
      opt.textContent = cat.label;
      sel.appendChild(opt);
    });
    if (current) sel.value = current;
  });
}

function getCatLabel(value) {
  return allCategories.find(c => c.value === value)?.label || value || 'Sin categoría';
}

function openCatModal() {
  renderCatChips();
  document.getElementById('newCatInput').value = '';
  document.getElementById('catModalOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('newCatInput').focus(), 100);
}

function closeCatModal() {
  document.getElementById('catModalOverlay').classList.remove('active');
  if (!document.getElementById('productModalOverlay').classList.contains('active'))
    document.body.style.overflow = '';
  syncCategorySelects();
  renderProductCards();
}

function renderCatChips() {
  const list = document.getElementById('catChipsList');
  if (!list) return;
  if (!allCategories.length) {
    list.innerHTML = '<div style="text-align:center;padding:1.5rem;color:#9BA7A0;font-size:.82rem;">No hay categorías aún</div>';
    return;
  }
  list.innerHTML = allCategories.map(cat => {
    const used = allProducts.filter(p => p.category === cat.value).length;
    return `
    <div class="cat-chip">
      <div class="cat-chip-left">
        <div class="cat-chip-icon ${!cat.custom?'default':''}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            ${!cat.custom ? '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>' : '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>'}
          </svg>
        </div>
        <div>
          <span class="cat-chip-name">${escHtml(cat.label)}</span>
          <span class="cat-chip-badge">${used} producto${used!==1?'s':''}</span>
          ${!cat.custom ? '<span class="cat-chip-badge" style="background:rgba(11,133,56,.1);color:#086A2C;">predeterminada</span>' : ''}
        </div>
      </div>
      <button class="btn-cat-delete" onclick="deleteCategory('${cat.value}')"
        ${!cat.custom ? 'disabled title="No se puede eliminar"' : `title="Eliminar ${escHtml(cat.label)}"`}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
      </button>
    </div>`;
  }).join('');
}

function addCategory() {
  const input = document.getElementById('newCatInput');
  const raw = input.value.trim();
  if (!raw) { input.focus(); return; }
  const value = raw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
  if (!value) { toast.warning('Nombre inválido'); return; }
  if (allCategories.find(c => c.value===value || c.label.toLowerCase()===raw.toLowerCase())) {
    toast.warning('Esa categoría ya existe'); input.select(); return;
  }
  allCategories.push({ value, label: raw, custom: true });
  saveCategories();
  syncCategorySelects();
  renderCatChips();
  input.value = '';
  input.focus();
  toast.success(`Categoría "${raw}" agregada`);
}

function deleteCategory(value) {
  const cat = allCategories.find(c => c.value===value);
  if (!cat || !cat.custom) { toast.warning('No se puede eliminar esta categoría'); return; }
  const used = allProducts.filter(p => p.category===value).length;
  showConfirm(
    `¿Eliminar "${cat.label}"?${used>0 ? ` Tiene ${used} producto(s) asignado(s) que quedarán sin categoría.` : ''}`,
    () => {
      if (used > 0) { allProducts = allProducts.map(p => p.category===value ? {...p,category:''} : p); saveProducts(); }
      allCategories = allCategories.filter(c => c.value!==value);
      saveCategories(); syncCategorySelects(); renderCatChips();
      toast.success(`Categoría "${cat.label}" eliminada`);
    }
  );
}

/* ─── NAVEGACIÓN ─── */
const pageTitleEl = document.getElementById('pageTitle');
const loader = document.getElementById('pageLoader');

function showView(viewName) {
  loader.classList.add('active');
  setTimeout(() => {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById(`view-${viewName}`);
    if (target) {
      target.classList.add('active');
      const titles = {
        dashboard:  'Dashboard',
        products:   'Catálogo de Productos',
        sales:      'Cotizaciones',
        clients:    'Clientes',
        services:   'Servicios de Reparación',
        reports:    'Reportes',
        inventory:  'Inventario',
        settings:   'Configuración',
      };
      if (pageTitleEl) pageTitleEl.textContent = titles[viewName] || 'Panel';

      if (viewName==='products')   renderProductCards();
      if (viewName==='dashboard')  { updateDashboard?.(); updateDashboardCount(); }
      if (viewName==='sales')      renderSalesTable?.();
      if (viewName==='clients')    renderClientsGrid?.();
      if (viewName==='services')   renderServicesTable?.();
      if (viewName==='reports')    renderReports?.();
      if (viewName==='inventory')  renderInventoryTable?.();
      if (viewName==='settings')   loadSettings?.();
    }
    loader.classList.remove('active');
  }, 240);
}

function navigate(e) {
  const link = e.target.closest('[data-view]');
  if (!link) return;
  e.preventDefault();
  const view = link.dataset.view;
  history.pushState({ view }, '', `#${view}`);
  showView(view);
  document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
  link.classList.add('active');
  if (window.innerWidth <= 992) closeSidebar();
}

document.addEventListener('click', navigate);
window.addEventListener('popstate', e => showView(e.state?.view || 'dashboard'));

/* ─── FECHA ─── */
const dateEl = document.getElementById('currentDate');
if (dateEl) dateEl.textContent = new Date().toLocaleDateString('es-PE', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

/* ─── PERSISTENCIA PRODUCTOS ─── */
function loadProducts() {
  const s = localStorage.getItem('imtecProducts');
  allProducts = s ? JSON.parse(s) : [];
  if (!s) ensureDemoProducts();
  saveProducts();
}

function saveProducts() {
  localStorage.setItem('imtecProducts', JSON.stringify(allProducts));
}

function ensureDemoProducts() {
  const DEMO = [
    {
      id:1, name:'Tóner HP 85A Negro (CE285A)',
      category:'toner_laser',
      image:'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&q=80',
      description:'Tóner compatible marca IMTEC para HP LaserJet P1102, P1102W, M1132, M1212nf. Alto rendimiento, impresión nítida.',
      brand:'HP', model:'CE285A',
      presentations:[{name:'Unidad',price:45},{name:'Pack x5',price:210}],
      stock:38, bestSelling:true, dateAdded:'2026-01-10'
    },
    {
      id:2, name:'Tóner Samsung MLT-D101S',
      category:'toner_laser',
      image:'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80',
      description:'Compatible con Samsung ML-2160, ML-2165, SCX-3400. Tóner compatible IMTEC de alta durabilidad.',
      brand:'Samsung', model:'MLT-D101S',
      presentations:[{name:'Unidad',price:42}],
      stock:24, bestSelling:false, dateAdded:'2026-01-15'
    },
    {
      id:3, name:'Tinta Epson T664 Sistema Continuo',
      category:'tintas',
      image:'https://images.unsplash.com/photo-1567177662154-dfeb4c93b6ae?w=400&q=80',
      description:'Tinta para sistema continuo Epson L200, L210, L355, L455. Kit 4 colores (CMYK). Larga duración.',
      brand:'Epson', model:'T664',
      presentations:[{name:'Botella 70ml',price:18},{name:'Kit 4 colores',price:65}],
      stock:55, bestSelling:true, dateAdded:'2026-01-20'
    },
    {
      id:4, name:'Drum Brother DR-1060',
      category:'drum',
      image:'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&q=80',
      description:'Fotoconductor compatible para Brother HL-1110, HL-1200, DCP-1510. Hasta 10,000 páginas.',
      brand:'Brother', model:'DR-1060',
      presentations:[{name:'Unidad',price:95}],
      stock:8, bestSelling:false, dateAdded:'2026-02-01'
    },
    {
      id:5, name:'Tóner Canon CRG-737',
      category:'toner_laser',
      image:'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80',
      description:'Compatible con Canon MF229dw, MF226dn, MF212w. Tóner compatible IMTEC. ~2,400 páginas.',
      brand:'Canon', model:'CRG-737',
      presentations:[{name:'Unidad',price:55}],
      stock:15, bestSelling:true, dateAdded:'2026-02-05'
    },
    {
      id:6, name:'Tinta Canon PG-745 / CL-746',
      category:'tintas',
      image:'https://images.unsplash.com/photo-1567177662154-dfeb4c93b6ae?w=400&q=80',
      description:'Para Canon PIXMA MG2570S, MG3070S, TS207. Negro + Color. Sistema continuo compatible.',
      brand:'Canon', model:'PG-745 / CL-746',
      presentations:[{name:'Negro',price:22},{name:'Color',price:25},{name:'Pack negro+color',price:44}],
      stock:30, bestSelling:false, dateAdded:'2026-02-10'
    },
  ];
  DEMO.forEach(d => { if (!allProducts.some(p => p.name===d.name)) allProducts.push(d); });
}

/* ─── RENDER CARDS ─── */
function renderProductCards() {
  const grid = document.getElementById('productCardsGrid');
  if (!grid) return;
  const cat  = document.getElementById('filterCategory')?.value || '';
  const q    = (document.getElementById('searchProducts')?.value || '').toLowerCase();

  let list = allProducts;
  if (cat) list = list.filter(p => p.category===cat);
  if (q)   list = list.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (p.description||'').toLowerCase().includes(q) ||
    (p.brand||'').toLowerCase().includes(q) ||
    (p.model||'').toLowerCase().includes(q)
  );

  const countEl = document.getElementById('productsCount');
  if (countEl) countEl.textContent = `${allProducts.length} producto${allProducts.length!==1?'s':''} registrado${allProducts.length!==1?'s':''}`;

  if (!list.length) {
    grid.innerHTML = `<div class="empty-products" style="grid-column:1/-1;">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
      <h3>${allProducts.length===0 ? 'Sin productos aún' : 'Sin resultados'}</h3>
      <p>${allProducts.length===0 ? 'Agrega tu primer producto.' : 'Intenta con otro filtro.'}</p>
    </div>`;
    return;
  }

  grid.innerHTML = list.map(p => {
    const minPrice = p.presentations?.length ? Math.min(...p.presentations.map(pr=>pr.price||0)) : 0;
    const lowStock = p.stock < 10;
    const catLabel = getCatLabel(p.category);
    const pills = (p.presentations||[]).slice(0,3).map(pr=>`<span class="pres-pill">${escHtml(pr.name)} · S/.${parseFloat(pr.price).toFixed(2)}</span>`).join('');
    const morePills = (p.presentations||[]).length>3 ? `<span class="pres-pill" style="color:var(--text-light);">+${p.presentations.length-3} más</span>` : '';
    const imgEl = p.image
      ? `<img src="${p.image}" alt="${escHtml(p.name)}" class="product-card-image" onclick="previewImage('${p.image.replace(/'/g,"\\'")}','${escHtml(p.name)}')" loading="lazy">`
      : `<div class="product-card-image-placeholder"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg></div>`;

    return `
    <div class="product-card">
      ${p.bestSelling ? '<span class="badge-best">★ Destacado</span>' : ''}
      ${lowStock ? `<span class="badge-stock-low">⚠ Stock bajo</span>` : ''}
      ${imgEl}
      <div class="product-card-body">
        <div class="product-card-top">
          <div class="product-card-name">${escHtml(p.name)}</div>
          <span class="product-card-id">#${p.id}</span>
        </div>
        ${p.brand || p.model ? `<div style="font-size:.72rem;color:var(--text-muted);margin-bottom:.2rem;">${[p.brand,p.model].filter(Boolean).join(' · ')}</div>` : ''}
        <span class="product-card-category">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
          ${escHtml(catLabel)}
        </span>
        <p class="product-card-desc">${escHtml(p.description||'')}</p>
        <div class="product-card-divider"></div>
        <div class="product-card-meta">
          <div class="product-card-price">S/. ${minPrice.toFixed(2)}<span>desde</span></div>
          <div class="product-card-stock ${lowStock?'low':''}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            ${p.stock} und.
          </div>
        </div>
        <div class="product-card-presentations">${pills}${morePills}</div>
      </div>
      <div class="product-card-actions">
        <button class="btn-card-action edit" onclick="editProduct(${p.id})">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Editar
        </button>
        <button class="btn-card-action delete" onclick="deleteProduct(${p.id})">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          Eliminar
        </button>
      </div>
    </div>`;
  }).join('');
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function updateDashboardCount() {
  const el = document.getElementById('dashProductCount');
  if (el) el.textContent = allProducts.length;
  const lowEl = document.getElementById('dashLowStock');
  if (lowEl) {
    const low = allProducts.filter(p => p.stock < 10).sort((a,b)=>a.stock-b.stock);
    if (!low.length) {
      lowEl.innerHTML = '<p style="color:var(--success);font-size:.85rem;padding:.25rem 0;display:flex;align-items:center;gap:.4rem;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Todos los stocks están en buen nivel</p>';
    } else {
      lowEl.innerHTML = low.map(p => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:.5rem .25rem;border-bottom:1px solid var(--border);">
          <span style="font-size:.83rem;color:var(--text);">${escHtml(p.name)}</span>
          <span style="font-size:.78rem;font-weight:700;color:${p.stock===0?'var(--danger)':'var(--warning)'};">${p.stock} und.</span>
        </div>`).join('');
    }
  }
}

/* ─── CRUD PRODUCTO ─── */
function newProduct() {
  currentEditingProduct = null;
  document.getElementById('productForm').reset();
  const nextId = allProducts.length > 0 ? Math.max(...allProducts.map(p=>p.id||0))+1 : 1;
  document.getElementById('productId').value = nextId;
  document.getElementById('imagePreview').style.display = 'none';
  document.getElementById('presentationsContainer').innerHTML = '';
  document.getElementById('productBrand').value = '';
  document.getElementById('productModel').value = '';
  syncCategorySelects();
  addPresentationRow();
  document.getElementById('modalTitle').textContent = 'Nuevo Producto';
  openProductModal();
}

function editProduct(id) {
  const p = allProducts.find(p=>p.id===id);
  if (!p) return;
  currentEditingProduct = id;
  document.getElementById('productId').value = p.id;
  document.getElementById('productName').value = p.name;
  document.getElementById('productImage').value = p.image || '';
  document.getElementById('productBrand').value = p.brand || '';
  document.getElementById('productModel').value = p.model || '';
  syncCategorySelects(p.category);
  document.getElementById('productCategory').value = p.category;
  document.getElementById('productDescription').value = p.description || '';
  document.getElementById('productStock').value = p.stock || 0;
  document.getElementById('productBestSelling').checked = !!p.bestSelling;
  showImagePreview(p.image);
  const container = document.getElementById('presentationsContainer');
  container.innerHTML = '';
  (p.presentations||[]).forEach(pr => addPresentationRow(pr.name, pr.price));
  document.getElementById('modalTitle').textContent = `Editar: ${p.name}`;
  openProductModal();
}

function deleteProduct(id) {
  const p = allProducts.find(p=>p.id===id);
  if (!p) return;
  showConfirm(`¿Eliminar "${p.name}"? Esta acción no se puede deshacer.`, () => {
    allProducts = allProducts.filter(p=>p.id!==id);
    saveProducts(); renderProductCards(); updateDashboardCount();
    toast.success('Producto eliminado');
  });
}

function addPresentationRow(name='', price='') {
  const container = document.getElementById('presentationsContainer');
  const div = document.createElement('div');
  div.className = 'presentation-item';
  div.innerHTML = `
    <div class="form-group">
      <label>Presentación</label>
      <input type="text" class="pres-name" value="${escHtml(String(name))}" placeholder="Unidad, Pack x5...">
    </div>
    <div class="form-group">
      <label>Precio S/.</label>
      <input type="number" class="pres-price" value="${price}" step="0.01" min="0" placeholder="0.00">
    </div>
    <button type="button" style="height:36px;width:32px;border:1.5px solid rgba(220,38,38,.3);background:rgba(220,38,38,.06);color:#dc2626;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;align-self:flex-end;transition:all .2s;flex-shrink:0;"
      onmouseover="this.style.background='#dc2626';this.style.color='white'"
      onmouseout="this.style.background='rgba(220,38,38,.06)';this.style.color='#dc2626'"
      onclick="this.closest('.presentation-item').remove()">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>`;
  container.appendChild(div);
}

function saveProduct(e) {
  e.preventDefault();
  const presentations = [];
  document.querySelectorAll('.presentation-item').forEach(item => {
    const name  = item.querySelector('.pres-name')?.value.trim();
    const price = parseFloat(item.querySelector('.pres-price')?.value);
    if (name && !isNaN(price)) presentations.push({ name, price });
  });
  if (!presentations.length) { toast.error('Agrega al menos una presentación'); return; }

  const data = {
    id:           currentEditingProduct || parseInt(document.getElementById('productId').value),
    name:         document.getElementById('productName').value.trim(),
    image:        document.getElementById('productImage').value.trim(),
    brand:        document.getElementById('productBrand').value.trim(),
    model:        document.getElementById('productModel').value.trim(),
    category:     document.getElementById('productCategory').value,
    description:  document.getElementById('productDescription').value.trim(),
    stock:        parseInt(document.getElementById('productStock').value) || 0,
    bestSelling:  document.getElementById('productBestSelling').checked,
    presentations,
    dateAdded: currentEditingProduct
      ? allProducts.find(p=>p.id===currentEditingProduct)?.dateAdded
      : new Date().toISOString()
  };

  if (currentEditingProduct) {
    const idx = allProducts.findIndex(p=>p.id===currentEditingProduct);
    if (idx!==-1) allProducts[idx] = data;
  } else {
    allProducts.push(data);
  }
  saveProducts(); renderProductCards(); updateDashboardCount(); closeProductModal();
  toast.success(currentEditingProduct ? 'Producto actualizado ✓' : 'Producto guardado ✓');
}

/* ─── MODAL ─── */
function openProductModal() {
  document.getElementById('productModalOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeProductModal() {
  document.getElementById('productModalOverlay').classList.remove('active');
  document.body.style.overflow = '';
}

/* ─── IMAGEN ─── */
function previewImage(url, name) {
  const ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:20000;display:flex;align-items:center;justify-content:center;cursor:zoom-out;';
  ov.innerHTML = `<img src="${url}" alt="${name||''}" style="max-width:90vw;max-height:90vh;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.5);">`;
  ov.onclick = () => ov.remove();
  document.body.appendChild(ov);
}

function showImagePreview(url) {
  const el = document.getElementById('imagePreview');
  if (url) { el.src=url; el.style.display='block'; }
  else { el.style.display='none'; }
}

function handleImageUpload(file) {
  if (!file || !file.type.startsWith('image/')) { toast.error('Selecciona una imagen válida'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById('productImage').value = e.target.result;
    showImagePreview(e.target.result);
  };
  reader.readAsDataURL(file);
}

/* ─── SIDEBAR MÓVIL ─── */
function openSidebar() {
  document.getElementById('adminSidebar').classList.add('show');
  document.getElementById('sidebarOverlay').classList.add('show');
  document.body.classList.add('sidebar-open');
}
function closeSidebar() {
  document.getElementById('adminSidebar').classList.remove('show');
  document.getElementById('sidebarOverlay').classList.remove('show');
  document.body.classList.remove('sidebar-open');
}

/* ─── INIT ─── */
document.addEventListener('DOMContentLoaded', () => {
  loadCategories();
  loadProducts();
  syncCategorySelects();

  const initialHash = location.hash.replace('#','') || 'dashboard';
  showView(initialHash);
  const initialLink = document.querySelector(`[data-view="${initialHash}"]`);
  if (initialLink) {
    document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
    initialLink.classList.add('active');
  }

  document.getElementById('sidebarToggle')?.addEventListener('click', openSidebar);
  document.getElementById('sidebarClose')?.addEventListener('click', closeSidebar);
  document.getElementById('sidebarOverlay')?.addEventListener('click', closeSidebar);

  document.getElementById('btnAddProduct')?.addEventListener('click', newProduct);
  document.getElementById('btnAddPresentation')?.addEventListener('click', () => addPresentationRow());
  document.getElementById('btnCloseModal')?.addEventListener('click', closeProductModal);
  document.getElementById('btnCancelForm')?.addEventListener('click', closeProductModal);
  document.getElementById('productForm')?.addEventListener('submit', saveProduct);
  document.getElementById('productModalOverlay')?.addEventListener('click', e => { if(e.target===e.currentTarget) closeProductModal(); });

  document.getElementById('btnUploadImage')?.addEventListener('click', e => { e.preventDefault(); document.getElementById('fileInput').click(); });
  document.getElementById('fileInput')?.addEventListener('change', e => { if(e.target.files[0]) handleImageUpload(e.target.files[0]); });
  document.getElementById('productImage')?.addEventListener('input', function(){ showImagePreview(this.value); });

  document.getElementById('searchProducts')?.addEventListener('input', renderProductCards);
  document.getElementById('filterCategory')?.addEventListener('change', renderProductCards);

  document.getElementById('btnManageCatsToolbar')?.addEventListener('click', openCatModal);
  document.getElementById('btnManageCatsForm')?.addEventListener('click', openCatModal);
  document.getElementById('btnCloseCatModal')?.addEventListener('click', closeCatModal);
  document.getElementById('catModalOverlay')?.addEventListener('click', e => { if(e.target===e.currentTarget) closeCatModal(); });
  document.getElementById('btnSaveCat')?.addEventListener('click', addCategory);
  document.getElementById('newCatInput')?.addEventListener('keydown', e => { if(e.key==='Enter'){ e.preventDefault(); addCategory(); } });
});