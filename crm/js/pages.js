/* ═══════════════════════════════════════════
   IMTEC ADMIN — pages.js
   Cotizaciones, Clientes, Servicios,
   Reportes, Inventario, Configuración
═══════════════════════════════════════════ */

let allSales     = [];
let allClients   = [];
let allServices  = [];
let currentEditingSale    = null;
let currentEditingClient  = null;
let currentEditingService = null;

/* ─── PERSISTENCIA ─── */
function loadSales()    { const s=localStorage.getItem('imtecSales');    allSales    = s ? JSON.parse(s) : demoSales();    saveSales(); }
function saveSales()    { localStorage.setItem('imtecSales',    JSON.stringify(allSales));    }
function loadClients()  { const s=localStorage.getItem('imtecClients');  allClients  = s ? JSON.parse(s) : demoClients(); saveClients(); }
function saveClients()  { localStorage.setItem('imtecClients',  JSON.stringify(allClients));  }
function loadServices() { const s=localStorage.getItem('imtecServices'); allServices = s ? JSON.parse(s) : demoServices(); saveServices(); }
function saveServices() { localStorage.setItem('imtecServices', JSON.stringify(allServices)); }

/* ─── DEMOS ─── */
function demoClients() {
  return [
    { id:1, name:'Empresa ABC SAC',      dni:'20512345678', email:'compras@abc.com',    phone:'969111222', address:'Av. Grau 123, Piura', status:'activo',   notes:'Cliente corporativo, paga puntual', dateAdded:'2026-01-10' },
    { id:2, name:'Notaría Rodrigo Vega', dni:'20445566778', email:'admin@notaria.com',  phone:'969333444', address:'Jr. Lima 45, Piura',  status:'activo',   notes:'Requiere factura cada mes',         dateAdded:'2026-01-18' },
    { id:3, name:'Carlos Mendoza',       dni:'47221890',    email:'cmendoza@gmail.com', phone:'969555666', address:'Calle Real 7, Piura', status:'inactivo', notes:'Compra ocasional',                  dateAdded:'2026-02-01' },
  ];
}

function demoSales() {
  return [
    { id:1, invoice:'COT-001', clientId:1, clientName:'Empresa ABC SAC',      date:'2026-02-10', items:[{name:'Tóner HP 85A',qty:5,price:45,presentation:'Unidad'},{name:'Drum Brother DR-1060',qty:1,price:95,presentation:'Unidad'}], total:320, status:'confirmado', notes:'' },
    { id:2, invoice:'COT-002', clientId:2, clientName:'Notaría Rodrigo Vega', date:'2026-02-12', items:[{name:'Tinta Epson T664',qty:3,price:65,presentation:'Kit 4 colores'}], total:195, status:'pendiente',  notes:'Esperando aprobación' },
    { id:3, invoice:'COT-003', clientId:3, clientName:'Carlos Mendoza',        date:'2026-02-14', items:[{name:'Tóner Samsung MLT-D101S',qty:2,price:42,presentation:'Unidad'}], total:84, status:'confirmado', notes:'' },
  ];
}

function demoServices() {
  return [
    { id:1, order:'SRV-001', clientId:1, clientName:'Empresa ABC SAC',      date:'2026-02-08', equipment:'HP LaserJet P1102W', brand:'HP', fault:'No imprime, atasca papel', diagnosis:'Rodillo de arrastre desgastado, se reemplazó', cost:80, deliveryDate:'2026-02-10', status:'entregado' },
    { id:2, order:'SRV-002', clientId:2, clientName:'Notaría Rodrigo Vega', date:'2026-02-13', equipment:'Epson L3110', brand:'Epson', fault:'Cabezal obstruido, imprime con rayas', diagnosis:'En diagnóstico', cost:0, deliveryDate:'2026-02-16', status:'en_proceso' },
    { id:3, order:'SRV-003', clientId:3, clientName:'Carlos Mendoza',       date:'2026-02-15', equipment:'Canon MF229dw', brand:'Canon', fault:'Error de fusor', diagnosis:'', cost:120, deliveryDate:'2026-02-18', status:'recibido' },
  ];
}

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate()+days);
  return d.toISOString().split('T')[0];
}

/* ─── DASHBOARD ─── */
function updateDashboard() {
  const set = (id,v) => { const el=document.getElementById(id); if(el) el.textContent=v; };
  set('dashProductCount', typeof allProducts!=='undefined' ? allProducts.length : 0);
  set('dashClientsCount', allClients.length);
  set('dashSalesCount',   allSales.length);
  const income = allSales.filter(s=>s.status==='confirmado').reduce((a,s)=>a+(s.total||0),0);
  set('dashIncome', `S/ ${income.toFixed(2)}`);

  // Cotizaciones recientes
  const recEl = document.getElementById('dashRecentSales');
  if (recEl) {
    if (!allSales.length) {
      recEl.innerHTML = '<div class="empty-products" style="padding:2rem;"><p>Sin cotizaciones aún</p></div>';
    } else {
      recEl.innerHTML = allSales.slice().reverse().slice(0,5).map(s=>`
        <div class="sales-item">
          <div>
            <p class="sales-invoice">${escHtml(s.invoice)}</p>
            <p class="sales-meta">${escHtml(s.clientName)} · ${formatDate(s.date)}</p>
          </div>
          <div class="sales-amount">
            <p class="amount">S/ ${(s.total||0).toFixed(2)}</p>
            <p class="items">${(s.items||[]).length} ítem(s)</p>
          </div>
        </div>`).join('');
    }
  }

  // Top productos
  const topEl = document.getElementById('dashTopProducts');
  if (topEl) {
    const map = {};
    allSales.forEach(s=>(s.items||[]).forEach(it=>{ map[it.name]=(map[it.name]||0)+(it.qty||1); }));
    const top = Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,5);
    topEl.innerHTML = !top.length
      ? '<div class="empty-products" style="padding:2rem;"><p>Sin datos aún</p></div>'
      : top.map(([name,qty],i)=>`
        <div class="product-item">
          <div class="product-number">${i+1}</div>
          <div class="product-name">${escHtml(name)}</div>
          <div class="product-quantity">${qty} und.</div>
        </div>`).join('');
  }

  updateDashboardCount?.();
}

/* ─── COTIZACIONES ─── */
function renderSalesTable() {
  const body   = document.getElementById('salesTableBody');
  const mobile = document.getElementById('salesMobileList');
  const q      = (document.getElementById('searchSales')?.value||'').toLowerCase();
  const statusF= document.getElementById('filterSalesStatus')?.value||'';

  let list = allSales;
  if (q)       list = list.filter(s=>(s.invoice||'').toLowerCase().includes(q)||(s.clientName||'').toLowerCase().includes(q));
  if (statusF) list = list.filter(s=>s.status===statusF);

  const paid    = allSales.filter(s=>s.status==='confirmado').length;
  const pending = allSales.filter(s=>s.status==='pendiente').length;
  const income  = allSales.filter(s=>s.status==='confirmado').reduce((a,s)=>a+(s.total||0),0);
  const items   = allSales.reduce((a,s)=>a+(s.items||[]).reduce((b,i)=>b+(i.qty||1),0),0);

  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
  set('salesCountLabel', `${allSales.length} cotización${allSales.length!==1?'es':''} registrada${allSales.length!==1?'s':''}`);
  set('salesTotalIncome', `S/ ${income.toFixed(2)}`);
  set('salesTotalItems', items);
  set('salesPaidCount', paid);
  set('salesPendingCount', pending);

  if (!list.length) {
    if (body)   body.innerHTML   = `<tr class="table-empty"><td colspan="7"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>No hay cotizaciones${q||statusF?' que coincidan':' aún'}</td></tr>`;
    if (mobile) mobile.innerHTML = '<div class="mobile-card" style="text-align:center;color:var(--text-muted);padding:2rem;">No hay cotizaciones aún</div>';
    return;
  }

  if (body) body.innerHTML = list.map(s=>`
    <tr>
      <td><strong>${escHtml(s.invoice)}</strong></td>
      <td>${escHtml(s.clientName)}</td>
      <td>${formatDate(s.date)}</td>
      <td>${(s.items||[]).reduce((a,i)=>a+(i.qty||1),0)} ítem(s)</td>
      <td><strong style="color:var(--primary)">S/ ${(s.total||0).toFixed(2)}</strong></td>
      <td><span class="status-badge status-${s.status}">${capitalizar(s.status)}</span></td>
      <td>
        <div class="table-actions">
          <button class="btn-tbl ver" onclick="viewSaleDetail(${s.id})" title="Ver detalle">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button class="btn-tbl edit" onclick="editSale(${s.id})" title="Editar">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-tbl delete" onclick="deleteSale(${s.id})" title="Eliminar">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </td>
    </tr>`).join('');

  if (mobile) mobile.innerHTML = list.map(s=>`
    <div class="mobile-card">
      <div class="mobile-card-top">
        <div><div class="mobile-card-title">${escHtml(s.invoice)}</div><div class="mobile-card-subtitle">${escHtml(s.clientName)}</div></div>
        <span class="status-badge status-${s.status}">${capitalizar(s.status)}</span>
      </div>
      <div class="mobile-card-row"><span>Fecha</span><span>${formatDate(s.date)}</span></div>
      <div class="mobile-card-row"><span>Ítems</span><span>${(s.items||[]).reduce((a,i)=>a+(i.qty||1),0)}</span></div>
      <div class="mobile-card-row"><span>Total</span><span class="mobile-card-amount">S/ ${(s.total||0).toFixed(2)}</span></div>
      <div class="mobile-card-actions">
        <button class="btn-tbl ver" onclick="viewSaleDetail(${s.id})"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
        <button class="btn-tbl edit" onclick="editSale(${s.id})"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
        <button class="btn-tbl delete" onclick="deleteSale(${s.id})"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></button>
      </div>
    </div>`).join('');
}

function viewSaleDetail(id) {
  const s = allSales.find(s=>s.id===id);
  if (!s) return;
  const existing = document.getElementById('saleDetailOverlay');
  if (existing) existing.remove();

  const statusColor = { confirmado:'#16a34a', pendiente:'#d97706', cancelado:'#dc2626' }[s.status] || '#888';
  const itemsHTML = (s.items||[]).map(it=>`
    <tr>
      <td style="padding:.5rem;border-bottom:1px solid #f0f0f0;">${escHtml(it.name)} ${it.presentation?`<span style="color:#aaa;font-size:.75rem;">(${escHtml(it.presentation)})</span>`:''}</td>
      <td style="padding:.5rem;border-bottom:1px solid #f0f0f0;text-align:center;">${it.qty}</td>
      <td style="padding:.5rem;border-bottom:1px solid #f0f0f0;text-align:right;">S/ ${parseFloat(it.price).toFixed(2)}</td>
      <td style="padding:.5rem;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:700;">S/ ${(it.qty*it.price).toFixed(2)}</td>
    </tr>`).join('');

  const overlay = document.createElement('div');
  overlay.id = 'saleDetailOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.6);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:1rem;overflow-y:auto;';
  overlay.innerHTML = `
    <div style="background:#fff;width:100%;max-width:500px;font-family:'DM Sans',system-ui;border-radius:12px;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,.25);">
      <div style="background:linear-gradient(135deg,#0B8538,#12A847);padding:1.5rem;color:#fff;text-align:center;">
        <div style="font-family:'Playfair Display',serif;font-size:1.5rem;font-weight:900;letter-spacing:-.5px;">IMTEC<span style="color:#7DFFAA;">.</span></div>
        <div style="font-size:.7rem;letter-spacing:.2em;text-transform:uppercase;opacity:.75;margin-top:.2rem;">Import & Tecnología EIRL</div>
        <div style="margin-top:1rem;font-size:1rem;font-weight:700;letter-spacing:.05em;">${escHtml(s.invoice)}</div>
        <div style="font-size:.78rem;opacity:.8;margin-top:.2rem;">${formatDate(s.date)}</div>
      </div>
      <div style="height:10px;background:repeating-linear-gradient(90deg,#fff 0,#fff 6px,transparent 6px,transparent 14px),#f5f5f5;background-size:14px 10px,100% 100%;"></div>
      <div style="padding:.625rem 1.5rem;background:#fafafa;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #eee;">
        <span style="font-size:.7rem;text-transform:uppercase;letter-spacing:.1em;color:#aaa;">Estado</span>
        <span style="padding:.2rem .7rem;border-radius:99px;font-size:.72rem;font-weight:700;text-transform:uppercase;background:${statusColor}18;color:${statusColor};">${capitalizar(s.status)}</span>
      </div>
      <div style="padding:.75rem 1.5rem;border-bottom:1px solid #eee;background:#fafafa;">
        <div style="font-size:.7rem;text-transform:uppercase;letter-spacing:.1em;color:#aaa;margin-bottom:.4rem;">Cliente</div>
        <div style="font-weight:700;font-size:.9rem;color:#222;">${escHtml(s.clientName)}</div>
      </div>
      <div style="padding:1rem 1.5rem;border-bottom:1px solid #eee;">
        <div style="font-size:.7rem;text-transform:uppercase;letter-spacing:.1em;color:#aaa;margin-bottom:.625rem;">Productos</div>
        <table style="width:100%;border-collapse:collapse;font-size:.82rem;">
          <thead><tr style="color:#aaa;font-size:.72rem;">
            <th style="text-align:left;padding-bottom:.35rem;font-weight:500;">Producto</th>
            <th style="text-align:center;padding-bottom:.35rem;font-weight:500;">Cant.</th>
            <th style="text-align:right;padding-bottom:.35rem;font-weight:500;">P.U.</th>
            <th style="text-align:right;padding-bottom:.35rem;font-weight:500;">Total</th>
          </tr></thead>
          <tbody>${itemsHTML}</tbody>
        </table>
      </div>
      <div style="padding:.875rem 1.5rem;display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #eee;">
        <span style="font-weight:700;font-size:1rem;">TOTAL</span>
        <span style="font-weight:700;font-size:1.3rem;color:#0B8538;">S/ ${(s.total||0).toFixed(2)}</span>
      </div>
      ${s.notes ? `<div style="padding:.75rem 1.5rem;font-size:.78rem;color:#888;border-bottom:1px solid #eee;">Nota: ${escHtml(s.notes)}</div>` : ''}
      <div style="padding:1rem 1.5rem;text-align:center;">
        <button onclick="document.getElementById('saleDetailOverlay').remove();document.body.style.overflow='';" style="padding:.6rem 1.5rem;background:#0B8538;color:#fff;border:none;border-radius:6px;font-family:inherit;font-size:.83rem;font-weight:600;cursor:pointer;">Cerrar</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
  overlay.addEventListener('click', e => { if(e.target===overlay){overlay.remove();document.body.style.overflow='';} });
}

function openSaleModal(title='Nueva Cotización') {
  document.getElementById('saleModalTitle').textContent = title;
  const sel = document.getElementById('saleClient');
  sel.innerHTML = '<option value="">-- Seleccionar cliente --</option>';
  allClients.forEach(c => { const o=document.createElement('option'); o.value=c.id; o.textContent=c.name; sel.appendChild(o); });
  document.getElementById('saleModalOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeSaleModal() {
  document.getElementById('saleModalOverlay').classList.remove('active');
  document.body.style.overflow = ''; currentEditingSale = null;
}

function newSale() {
  currentEditingSale = null;
  document.getElementById('saleForm').reset();
  const settings = getSettings();
  const nextId = allSales.length > 0 ? Math.max(...allSales.map(s=>s.id))+1 : 1;
  document.getElementById('saleInvoice').value = `${settings.invPrefix||'COT-'}${String(nextId).padStart(3,'0')}`;
  document.getElementById('saleDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('saleItemsContainer').innerHTML = '';
  addSaleItem();
  openSaleModal('Nueva Cotización');
}

function editSale(id) {
  const s = allSales.find(s=>s.id===id);
  if (!s) return;
  currentEditingSale = id;
  document.getElementById('saleInvoice').value = s.invoice;
  document.getElementById('saleDate').value    = s.date;
  document.getElementById('saleStatus').value  = s.status;
  document.getElementById('saleNotes').value   = s.notes||'';
  document.getElementById('saleItemsContainer').innerHTML = '';
  (s.items||[]).forEach(it=>addSaleItem(it.name,it.qty,it.price,it.presentation||''));
  openSaleModal(`Editar: ${s.invoice}`);
  setTimeout(()=>{ document.getElementById('saleClient').value=s.clientId||''; }, 60);
  updateSaleTotal();
}

function deleteSale(id) {
  const s = allSales.find(s=>s.id===id);
  if (!s) return;
  showConfirm(`¿Eliminar cotización <strong>${escHtml(s.invoice)}</strong>?`, () => {
    allSales = allSales.filter(s=>s.id!==id);
    saveSales(); renderSalesTable(); updateDashboard?.();
    showToast('Cotización eliminada');
  });
}

function addSaleItem(name='', qty=1, price=0, presentation='') {
  const c = document.getElementById('saleItemsContainer');
  const div = document.createElement('div');
  div.className = 'presentation-item';
  div.innerHTML = `
    <div class="form-group"><label>Producto</label><input type="text" class="sale-item-name" value="${escHtml(String(name))}" placeholder="Tóner HP 85A..." required style="padding:.55rem .7rem;border:1.5px solid #e5e7eb;border-radius:6px;font-family:inherit;font-size:.83rem;width:100%;outline:none;" onfocus="this.style.borderColor='#0B8538'" onblur="this.style.borderColor='#e5e7eb'"></div>
    <div class="form-group"><label>Present.</label><input type="text" class="sale-item-presentation" value="${escHtml(String(presentation))}" placeholder="Unidad..." style="padding:.55rem .7rem;border:1.5px solid #e5e7eb;border-radius:6px;font-family:inherit;font-size:.83rem;width:100%;outline:none;" onfocus="this.style.borderColor='#0B8538'" onblur="this.style.borderColor='#e5e7eb'"></div>
    <div class="form-group"><label>Cant.</label><input type="number" class="sale-item-qty" value="${qty}" min="1" oninput="updateSaleTotal()" style="padding:.55rem .5rem;border:1.5px solid #e5e7eb;border-radius:6px;font-family:inherit;font-size:.83rem;width:100%;outline:none;" onfocus="this.style.borderColor='#0B8538'" onblur="this.style.borderColor='#e5e7eb'"></div>
    <div class="form-group"><label>Precio S/.</label><input type="number" class="sale-item-price" value="${price}" min="0" step="0.01" oninput="updateSaleTotal()" style="padding:.55rem .5rem;border:1.5px solid #e5e7eb;border-radius:6px;font-family:inherit;font-size:.83rem;width:100%;outline:none;" onfocus="this.style.borderColor='#0B8538'" onblur="this.style.borderColor='#e5e7eb'"></div>
    <button type="button" onclick="this.closest('.presentation-item').remove();updateSaleTotal();"
      style="height:34px;width:32px;border:1.5px solid rgba(220,38,38,.3);background:rgba(220,38,38,.06);color:#dc2626;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;align-self:flex-end;transition:all .2s;flex-shrink:0;"
      onmouseover="this.style.background='#dc2626';this.style.color='white'"
      onmouseout="this.style.background='rgba(220,38,38,.06)';this.style.color='#dc2626'">×</button>`;
  c.appendChild(div); updateSaleTotal();
}

function updateSaleTotal() {
  let total = 0;
  document.querySelectorAll('#saleItemsContainer .presentation-item').forEach(row=>{
    total += (parseFloat(row.querySelector('.sale-item-qty')?.value)||0) * (parseFloat(row.querySelector('.sale-item-price')?.value)||0);
  });
  const el = document.getElementById('saleTotalDisplay');
  if (el) el.textContent = `S/ ${total.toFixed(2)}`;
}

function saveSaleForm(e) {
  e.preventDefault();
  const clientId = parseInt(document.getElementById('saleClient').value);
  const client   = allClients.find(c=>c.id===clientId);
  const items = [];
  let total = 0;
  document.querySelectorAll('#saleItemsContainer .presentation-item').forEach(row=>{
    const name  = row.querySelector('.sale-item-name')?.value.trim();
    const qty   = parseFloat(row.querySelector('.sale-item-qty')?.value)||0;
    const price = parseFloat(row.querySelector('.sale-item-price')?.value)||0;
    const pres  = row.querySelector('.sale-item-presentation')?.value.trim()||'';
    if (name && qty>0) { items.push({name,presentation:pres,qty,price}); total+=qty*price; }
  });
  if (!items.length) { showToast('Agrega al menos un producto',true); return; }
  if (!clientId)     { showToast('Selecciona un cliente',true); return; }

  const data = {
    id:         currentEditingSale||(allSales.length>0?Math.max(...allSales.map(s=>s.id))+1:1),
    invoice:    document.getElementById('saleInvoice').value,
    clientId, clientName: client?.name||'',
    date:       document.getElementById('saleDate').value,
    status:     document.getElementById('saleStatus').value,
    notes:      document.getElementById('saleNotes').value.trim(),
    items, total
  };

  if (currentEditingSale) {
    const idx = allSales.findIndex(s=>s.id===currentEditingSale);
    if (idx!==-1) allSales[idx]=data;
  } else { allSales.push(data); }

  saveSales(); renderSalesTable(); updateDashboard?.(); closeSaleModal();
  showToast(currentEditingSale?'Cotización actualizada ✓':'Cotización registrada ✓');
}

/* ─── CLIENTES ─── */
function renderClientsGrid() {
  const grid    = document.getElementById('clientsGrid');
  const q       = (document.getElementById('searchClients')?.value||'').toLowerCase();
  const statusF = document.getElementById('filterClientsStatus')?.value||'';

  let list = allClients;
  if (q)       list = list.filter(c=>c.name.toLowerCase().includes(q)||(c.email||'').toLowerCase().includes(q)||(c.phone||'').includes(q));
  if (statusF) list = list.filter(c=>c.status===statusF);

  const el = document.getElementById('clientsCountLabel');
  if (el) el.textContent = `${allClients.length} cliente${allClients.length!==1?'s':''} registrado${allClients.length!==1?'s':''}`;

  if (!grid) return;
  if (!list.length) {
    grid.innerHTML = `<div class="empty-products" style="grid-column:1/-1;">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      <h3>${!allClients.length?'Sin clientes aún':'Sin resultados'}</h3>
      <p>${!allClients.length?'Agrega tu primer cliente.':'Intenta con otro filtro.'}</p>
    </div>`;
    return;
  }
  grid.innerHTML = list.map(c=>{
    const purchases = allSales.filter(s=>s.clientId===c.id).length;
    return `
    <div class="client-card">
      <div class="client-avatar-big">${c.name.charAt(0).toUpperCase()}</div>
      <div class="client-card-name">${escHtml(c.name)}</div>
      <div class="client-card-dni">${c.dni?'RUC/DNI: '+escHtml(c.dni):'Sin documento'}</div>
      <div class="client-card-info">
        ${c.email?`<div class="client-card-info-item"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>${escHtml(c.email)}</div>`:''}
        ${c.phone?`<div class="client-card-info-item"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l.95-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>${escHtml(c.phone)}</div>`:''}
        ${c.address?`<div class="client-card-info-item"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${escHtml(c.address)}</div>`:''}
        ${c.notes?`<div class="client-card-info-item" style="font-style:italic;color:var(--text-light);">${escHtml(c.notes)}</div>`:''}
      </div>
      <div class="client-card-footer">
        <div>
          <span class="status-badge status-${c.status}">${capitalizar(c.status)}</span>
          <div class="client-purchases" style="margin-top:.35rem;"><strong>${purchases}</strong> cotización${purchases!==1?'es':''}</div>
        </div>
        <div class="client-card-actions">
          <button class="btn-client-action edit" onclick="editClient(${c.id})"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Editar</button>
          <button class="btn-client-action delete" onclick="deleteClient(${c.id})"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function openClientModal(title='Nuevo Cliente') {
  document.getElementById('clientModalTitle').textContent = title;
  document.getElementById('clientModalOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeClientModal() {
  document.getElementById('clientModalOverlay').classList.remove('active');
  document.body.style.overflow = ''; currentEditingClient = null;
}
function newClient() { currentEditingClient=null; document.getElementById('clientForm').reset(); openClientModal('Nuevo Cliente'); }
function editClient(id) {
  const c = allClients.find(c=>c.id===id); if (!c) return;
  currentEditingClient = id;
  ['clientName','clientDNI','clientEmail','clientPhone','clientAddress','clientStatus','clientNotes'].forEach(fid => {
    const key = fid.replace('client','').charAt(0).toLowerCase()+fid.replace('client','').slice(1);
    const el = document.getElementById(fid); if(el) el.value = c[key]||'';
  });
  openClientModal(`Editar: ${c.name}`);
}
function deleteClient(id) {
  const c = allClients.find(c=>c.id===id); if (!c) return;
  showConfirm(`¿Eliminar cliente "${c.name}"?`, () => {
    allClients=allClients.filter(c=>c.id!==id); saveClients(); renderClientsGrid(); updateDashboard?.();
    showToast('Cliente eliminado');
  });
}
function saveClientForm(e) {
  e.preventDefault();
  const data = {
    id: currentEditingClient||(allClients.length>0?Math.max(...allClients.map(c=>c.id))+1:1),
    name:    document.getElementById('clientName').value.trim(),
    dni:     document.getElementById('clientDNI').value.trim(),
    email:   document.getElementById('clientEmail').value.trim(),
    phone:   document.getElementById('clientPhone').value.trim(),
    address: document.getElementById('clientAddress').value.trim(),
    status:  document.getElementById('clientStatus').value,
    notes:   document.getElementById('clientNotes').value.trim(),
    dateAdded: currentEditingClient ? allClients.find(c=>c.id===currentEditingClient)?.dateAdded : new Date().toISOString().split('T')[0],
  };
  if (currentEditingClient) { const idx=allClients.findIndex(c=>c.id===currentEditingClient); if(idx!==-1) allClients[idx]=data; }
  else allClients.push(data);
  saveClients(); renderClientsGrid(); updateDashboard?.(); closeClientModal();
  showToast(currentEditingClient?'Cliente actualizado ✓':'Cliente guardado ✓');
}

/* ─── SERVICIOS ─── */
function renderServicesTable() {
  const body   = document.getElementById('servicesTableBody');
  const mobile = document.getElementById('servicesMobileList');
  const q      = (document.getElementById('searchServices')?.value||'').toLowerCase();
  const statusF= document.getElementById('filterServiceStatus')?.value||'';

  let list = allServices;
  if (q)       list = list.filter(s=>(s.order||'').toLowerCase().includes(q)||(s.clientName||'').toLowerCase().includes(q)||(s.equipment||'').toLowerCase().includes(q));
  if (statusF) list = list.filter(s=>s.status===statusF);

  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
  set('servicesCountLabel', `${allServices.length} orden${allServices.length!==1?'es':''} registrada${allServices.length!==1?'s':''}`);
  set('svcTotal',   allServices.length);
  set('svcPending', allServices.filter(s=>['recibido','en_proceso'].includes(s.status)).length);
  set('svcDone',    allServices.filter(s=>['completado','entregado'].includes(s.status)).length);
  set('svcIncome',  `S/ ${allServices.filter(s=>['completado','entregado'].includes(s.status)).reduce((a,s)=>a+(s.cost||0),0).toFixed(2)}`);

  if (!list.length) {
    if (body)   body.innerHTML   = `<tr class="table-empty"><td colspan="8"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>No hay órdenes${q||statusF?' que coincidan':' aún'}</td></tr>`;
    if (mobile) mobile.innerHTML = '<div class="mobile-card" style="text-align:center;color:var(--text-muted);padding:2rem;">No hay órdenes aún</div>';
    return;
  }

  const labelStatus = { recibido:'Recibido', en_proceso:'En proceso', completado:'Completado', entregado:'Entregado' };

  if (body) body.innerHTML = list.map(s=>`
    <tr>
      <td><strong>${escHtml(s.order)}</strong></td>
      <td>${escHtml(s.clientName)}</td>
      <td>${escHtml(s.equipment)}</td>
      <td style="max-width:160px;"><span style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${escHtml(s.fault)}">${escHtml(s.fault)}</span></td>
      <td>${formatDate(s.date)}</td>
      <td><strong style="color:var(--primary)">S/ ${(s.cost||0).toFixed(2)}</strong></td>
      <td><span class="status-badge status-${s.status}">${labelStatus[s.status]||s.status}</span></td>
      <td>
        <div class="table-actions">
          <button class="btn-tbl edit" onclick="editService(${s.id})" title="Editar">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-tbl delete" onclick="deleteService(${s.id})" title="Eliminar">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </td>
    </tr>`).join('');

  if (mobile) mobile.innerHTML = list.map(s=>`
    <div class="mobile-card">
      <div class="mobile-card-top">
        <div><div class="mobile-card-title">${escHtml(s.order)}</div><div class="mobile-card-subtitle">${escHtml(s.clientName)}</div></div>
        <span class="status-badge status-${s.status}">${labelStatus[s.status]||s.status}</span>
      </div>
      <div class="mobile-card-row"><span>Equipo</span><span>${escHtml(s.equipment)}</span></div>
      <div class="mobile-card-row"><span>Fecha</span><span>${formatDate(s.date)}</span></div>
      <div class="mobile-card-row"><span>Costo</span><span class="mobile-card-amount">S/ ${(s.cost||0).toFixed(2)}</span></div>
      <div class="mobile-card-actions">
        <button class="btn-tbl edit" onclick="editService(${s.id})"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
        <button class="btn-tbl delete" onclick="deleteService(${s.id})"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></button>
      </div>
    </div>`).join('');
}

function openServiceModal(title='Nueva Orden de Servicio') {
  document.getElementById('serviceModalTitle').textContent = title;
  const sel = document.getElementById('serviceClient');
  sel.innerHTML = '<option value="">-- Seleccionar cliente --</option>';
  allClients.forEach(c=>{ const o=document.createElement('option'); o.value=c.id; o.textContent=c.name; sel.appendChild(o); });
  document.getElementById('serviceModalOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeServiceModal() {
  document.getElementById('serviceModalOverlay').classList.remove('active');
  document.body.style.overflow = ''; currentEditingService = null;
}

function newService() {
  currentEditingService = null;
  document.getElementById('serviceForm').reset();
  const nextId = allServices.length>0 ? Math.max(...allServices.map(s=>s.id))+1 : 1;
  document.getElementById('serviceOrder').value = `SRV-${String(nextId).padStart(3,'0')}`;
  document.getElementById('serviceDate').value  = new Date().toISOString().split('T')[0];
  openServiceModal('Nueva Orden de Servicio');
}

function editService(id) {
  const s = allServices.find(s=>s.id===id); if (!s) return;
  currentEditingService = id;
  document.getElementById('serviceOrder').value         = s.order;
  document.getElementById('serviceDate').value          = s.date;
  document.getElementById('serviceStatus').value        = s.status;
  document.getElementById('serviceEquipment').value     = s.equipment||'';
  document.getElementById('serviceEquipmentBrand').value= s.brand||'';
  document.getElementById('serviceFault').value         = s.fault||'';
  document.getElementById('serviceDiagnosis').value     = s.diagnosis||'';
  document.getElementById('serviceCost').value          = s.cost||0;
  document.getElementById('serviceDeliveryDate').value  = s.deliveryDate||'';
  openServiceModal(`Editar: ${s.order}`);
  setTimeout(()=>{ document.getElementById('serviceClient').value=s.clientId||''; }, 60);
}

function deleteService(id) {
  const s = allServices.find(s=>s.id===id); if (!s) return;
  showConfirm(`¿Eliminar orden ${s.order}?`, () => {
    allServices=allServices.filter(s=>s.id!==id); saveServices(); renderServicesTable();
    showToast('Orden eliminada');
  });
}

function saveServiceForm(e) {
  e.preventDefault();
  const clientId = parseInt(document.getElementById('serviceClient').value);
  const client   = allClients.find(c=>c.id===clientId);
  const data = {
    id:           currentEditingService||(allServices.length>0?Math.max(...allServices.map(s=>s.id))+1:1),
    order:        document.getElementById('serviceOrder').value,
    clientId, clientName: client?.name||'',
    date:         document.getElementById('serviceDate').value,
    status:       document.getElementById('serviceStatus').value,
    equipment:    document.getElementById('serviceEquipment').value.trim(),
    brand:        document.getElementById('serviceEquipmentBrand').value.trim(),
    fault:        document.getElementById('serviceFault').value.trim(),
    diagnosis:    document.getElementById('serviceDiagnosis').value.trim(),
    cost:         parseFloat(document.getElementById('serviceCost').value)||0,
    deliveryDate: document.getElementById('serviceDeliveryDate').value,
  };
  if (!clientId) { showToast('Selecciona un cliente',true); return; }
  if (currentEditingService) { const idx=allServices.findIndex(s=>s.id===currentEditingService); if(idx!==-1) allServices[idx]=data; }
  else allServices.push(data);
  saveServices(); renderServicesTable(); closeServiceModal();
  showToast(currentEditingService?'Orden actualizada ✓':'Orden registrada ✓');
}

/* ─── REPORTES ─── */
function renderReports() { renderIncomeChart(); renderCategoryReport(); renderTopClientsReport(); renderLowStockReport(); }

function renderIncomeChart() {
  const container = document.getElementById('incomeChart'); if (!container) return;
  const months = [];
  for (let i=5;i>=0;i--) { const d=new Date(); d.setMonth(d.getMonth()-i); months.push({key:`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`,label:d.toLocaleString('es-PE',{month:'short'})}); }
  const map = {};
  allSales.filter(s=>s.status==='confirmado').forEach(s=>{ const k=s.date?.substring(0,7); if(k) map[k]=(map[k]||0)+(s.total||0); });
  const values = months.map(m=>map[m.key]||0);
  const maxVal = Math.max(...values,1);
  container.innerHTML = months.map((m,i)=>{
    const h = Math.max(4,Math.round((values[i]/maxVal)*160));
    return `<div class="chart-bar-group"><div class="chart-bar" style="height:${h}px;"><div class="chart-bar-tooltip">S/ ${values[i].toFixed(2)}</div></div><div class="chart-bar-label">${m.label}</div><div class="chart-bar-value">S/${values[i]>0?values[i].toFixed(0):'0'}</div></div>`;
  }).join('');
}

function renderCategoryReport() {
  const el = document.getElementById('categoryReport'); if (!el) return;
  const map = {};
  allSales.forEach(s=>(s.items||[]).forEach(it=>{ const cat = (typeof allProducts!=='undefined' ? allProducts.find(p=>p.name.toLowerCase()===(it.name||'').toLowerCase())?.category : null); const label = cat ? (getCatLabel?.(cat)||cat) : 'Otros'; map[label]=(map[label]||0)+(it.qty||1)*(it.price||0); }));
  const entries = Object.entries(map).sort((a,b)=>b[1]-a[1]);
  el.innerHTML = !entries.length ? '<div class="report-empty">Sin datos de ventas</div>' : entries.map(([cat,total],i)=>`<div class="report-list-item"><div class="report-rank">${i+1}</div><div class="report-item-info"><div class="report-item-name">${escHtml(cat)}</div><div class="report-item-sub">Categoría</div></div><div class="report-item-value">S/ ${total.toFixed(2)}</div></div>`).join('');
}

function renderTopClientsReport() {
  const el = document.getElementById('topClientsReport'); if (!el) return;
  const map = {};
  allSales.filter(s=>s.status==='confirmado').forEach(s=>{ map[s.clientName]=(map[s.clientName]||0)+(s.total||0); });
  const entries = Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,5);
  el.innerHTML = !entries.length ? '<div class="report-empty">Sin datos</div>' : entries.map(([name,total],i)=>`<div class="report-list-item"><div class="report-rank">${i+1}</div><div class="report-item-info"><div class="report-item-name">${escHtml(name)}</div><div class="report-item-sub">Cliente</div></div><div class="report-item-value">S/ ${total.toFixed(2)}</div></div>`).join('');
}

function renderLowStockReport() {
  const el = document.getElementById('lowStockReport'); if (!el) return;
  if (typeof allProducts==='undefined') { el.innerHTML='<div class="report-empty">Sin datos</div>'; return; }
  const low = allProducts.filter(p=>p.stock<10).sort((a,b)=>a.stock-b.stock);
  el.innerHTML = !low.length
    ? '<div class="report-empty" style="color:var(--success);">✓ Todos los stocks están bien</div>'
    : low.map(p=>`<div class="report-list-item"><div class="report-rank warn">${p.stock}</div><div class="report-item-info"><div class="report-item-name">${escHtml(p.name)}</div><div class="report-item-sub">${p.stock===0?'⚠ Sin stock':'Stock bajo'}</div></div><div class="report-item-value" style="color:var(--danger);">${p.stock} und.</div></div>`).join('');
}

/* ─── INVENTARIO ─── */
function renderInventoryTable() {
  const body = document.getElementById('inventoryTableBody'); if (!body) return;
  const q    = (document.getElementById('searchInventory')?.value||'').toLowerCase();
  const stF  = document.getElementById('filterInventoryStatus')?.value||'';

  let list = typeof allProducts!=='undefined' ? [...allProducts] : [];
  if (q)   list=list.filter(p=>p.name.toLowerCase().includes(q)||(p.brand||'').toLowerCase().includes(q));
  if (stF==='ok')    list=list.filter(p=>p.stock>=10);
  if (stF==='low')   list=list.filter(p=>p.stock>0&&p.stock<10);
  if (stF==='empty') list=list.filter(p=>p.stock===0);

  if (!list.length) { body.innerHTML=`<tr class="table-empty"><td colspan="5">No hay productos${q||stF?' que coincidan':''}</td></tr>`; return; }

  body.innerHTML = list.map(p=>{
    const statusLabel = p.stock===0 ? '<span class="status-badge status-cancelado">Sin stock</span>' : p.stock<10 ? '<span class="status-badge status-pendiente">Stock bajo</span>' : '<span class="status-badge status-confirmado">OK</span>';
    return `
    <tr>
      <td><strong>${escHtml(p.name)}</strong> ${p.brand?`<span style="color:var(--text-muted);font-size:.75rem;">(${escHtml(p.brand)})</span>`:''}</td>
      <td>${escHtml(getCatLabel?.(p.category)||p.category)}</td>
      <td><strong style="font-size:1.05rem;${p.stock===0?'color:var(--danger)':p.stock<10?'color:var(--warning)':'color:var(--success)'}">${p.stock}</strong></td>
      <td>${statusLabel}</td>
      <td>
        <div style="display:flex;align-items:center;gap:.5rem;">
          <input type="number" min="0" value="${p.stock}" style="width:70px;padding:.35rem .5rem;border:1.5px solid var(--border);border-radius:6px;font-family:inherit;font-size:.82rem;outline:none;" id="stock_${p.id}" onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='var(--border)'">
          <button onclick="updateStock(${p.id})" style="padding:.35rem .75rem;background:var(--primary);color:#fff;border:none;border-radius:6px;font-family:inherit;font-size:.75rem;font-weight:600;cursor:pointer;transition:background .2s;" onmouseover="this.style.background='var(--primary-dark)'" onmouseout="this.style.background='var(--primary)'">Actualizar</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function updateStock(id) {
  if (typeof allProducts==='undefined') return;
  const input = document.getElementById(`stock_${id}`);
  const val   = parseInt(input?.value);
  if (isNaN(val)||val<0) { showToast('Valor de stock inválido',true); return; }
  const idx = allProducts.findIndex(p=>p.id===id);
  if (idx!==-1) { allProducts[idx].stock=val; saveProducts?.(); renderInventoryTable(); showToast('Stock actualizado ✓'); updateDashboardCount?.(); }
}

/* ─── CONFIGURACIÓN ─── */
function getSettings() {
  const s = localStorage.getItem('imtecSettings');
  return s ? JSON.parse(s) : { igv:18, dueDays:15, invPrefix:'COT-' };
}
function loadSettings() {
  const s = getSettings();
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.value=v;};
  set('settingBusinessName', s.businessName||'IMTEC Piura');
  set('settingRUC',          s.ruc||'');
  set('settingAddress',      s.address||'Av. Loreto 212, Barrio Norte, Piura');
  set('settingPhone',        s.phone||'969981040 / 947299100 / 942086775');
  set('settingEmail',        s.email||'imtecpiura@hotmail.com');
  set('settingInvPrefix',    s.invPrefix||'COT-');
  set('settingIGV',          s.igv??18);
  set('settingDueDays',      s.dueDays??15);
  set('settingInvNote',      s.invNote||'Precios sujetos a variación sin previo aviso. Cotización válida por los días indicados.');
}
function saveSettings() {
  const g=(id)=>document.getElementById(id)?.value||'';
  const data = {
    businessName: g('settingBusinessName'),
    ruc:          g('settingRUC'),
    address:      g('settingAddress'),
    phone:        g('settingPhone'),
    email:        g('settingEmail'),
    invPrefix:    g('settingInvPrefix')||'COT-',
    igv:          parseFloat(g('settingIGV'))||18,
    dueDays:      parseInt(g('settingDueDays'))||15,
    invNote:      g('settingInvNote'),
  };
  localStorage.setItem('imtecSettings', JSON.stringify(data));
  showToast('Configuración guardada ✓');
}

/* ─── HELPERS ─── */
function capitalizar(s) { return s ? s.charAt(0).toUpperCase()+s.slice(1).replace('_',' ') : ''; }
function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr+'T12:00:00');
  return d.toLocaleDateString('es-PE',{day:'2-digit',month:'short',year:'numeric'});
}
function escHtml(str) { return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

/* ─── INIT ─── */
document.addEventListener('DOMContentLoaded', () => {
  loadClients();
  loadSales();
  loadServices();

  document.getElementById('btnAddSale')?.addEventListener('click', newSale);
  document.getElementById('btnAddClient')?.addEventListener('click', newClient);
  document.getElementById('btnAddService')?.addEventListener('click', newService);

  document.getElementById('btnCloseSaleModal')?.addEventListener('click', closeSaleModal);
  document.getElementById('btnCancelSaleForm')?.addEventListener('click', closeSaleModal);
  document.getElementById('saleModalOverlay')?.addEventListener('click', e=>{if(e.target===e.currentTarget)closeSaleModal();});

  document.getElementById('btnCloseClientModal')?.addEventListener('click', closeClientModal);
  document.getElementById('btnCancelClientForm')?.addEventListener('click', closeClientModal);
  document.getElementById('clientModalOverlay')?.addEventListener('click', e=>{if(e.target===e.currentTarget)closeClientModal();});

  document.getElementById('btnCloseServiceModal')?.addEventListener('click', closeServiceModal);
  document.getElementById('btnCancelServiceForm')?.addEventListener('click', closeServiceModal);
  document.getElementById('serviceModalOverlay')?.addEventListener('click', e=>{if(e.target===e.currentTarget)closeServiceModal();});

  document.getElementById('saleForm')?.addEventListener('submit', saveSaleForm);
  document.getElementById('clientForm')?.addEventListener('submit', saveClientForm);
  document.getElementById('serviceForm')?.addEventListener('submit', saveServiceForm);
  document.getElementById('btnAddSaleItem')?.addEventListener('click', ()=>addSaleItem());

  document.getElementById('searchSales')?.addEventListener('input', renderSalesTable);
  document.getElementById('filterSalesStatus')?.addEventListener('change', renderSalesTable);
  document.getElementById('searchClients')?.addEventListener('input', renderClientsGrid);
  document.getElementById('filterClientsStatus')?.addEventListener('change', renderClientsGrid);
  document.getElementById('searchServices')?.addEventListener('input', renderServicesTable);
  document.getElementById('filterServiceStatus')?.addEventListener('change', renderServicesTable);
  document.getElementById('searchInventory')?.addEventListener('input', renderInventoryTable);
  document.getElementById('filterInventoryStatus')?.addEventListener('change', renderInventoryTable);
  document.getElementById('reportPeriod')?.addEventListener('change', renderReports);
  document.getElementById('btnExportReport')?.addEventListener('click', ()=>showToast('Exportación en desarrollo'));

  updateDashboard();
});