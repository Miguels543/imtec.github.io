/* ========================================
   TOAST.JS - SISTEMA DE NOTIFICACIONES
   Roses Bienestar · reemplaza window.alert
   ======================================== */

/* ── Estilos ── */
(function injectStyles() {
  if (document.getElementById('_rosesToastStyles')) return;
  const style = document.createElement('style');
  style.id = '_rosesToastStyles';
  style.textContent = `
    /* Contenedor */
    #roses-toast-container {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      gap: .65rem;
      pointer-events: none;
    }

    /* Toast base */
    .roses-toast {
      display: flex;
      align-items: center;
      gap: .85rem;
      padding: .95rem 1.35rem;
      min-width: 280px;
      max-width: 380px;
      background: #fff;
      border-left: 3px solid var(--primary, #4A7043);
      box-shadow: 0 8px 32px rgba(0,0,0,.12), 0 2px 8px rgba(0,0,0,.06);
      font-family: var(--font-body, 'DM Sans', system-ui, sans-serif);
      font-size: .88rem;
      font-weight: 500;
      color: #333;
      line-height: 1.4;
      pointer-events: auto;
      animation: toastIn .35s cubic-bezier(.22,.8,.36,1) forwards;
    }

    .roses-toast.removing {
      animation: toastOut .3s ease forwards;
    }

    /* Variantes */
    .roses-toast.success { border-color: var(--primary, #4A7043); }
    .roses-toast.error   { border-color: #dc2626; }
    .roses-toast.warning { border-color: var(--gold, #C9A96E); }
    .roses-toast.info    { border-color: #3b82f6; }

    /* Ícono */
    .roses-toast-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      flex-shrink: 0;
    }
    .roses-toast.success .roses-toast-icon { background: rgba(74,112,67,.1);  color: var(--primary, #4A7043); }
    .roses-toast.error   .roses-toast-icon { background: rgba(220,38,38,.1);  color: #dc2626; }
    .roses-toast.warning .roses-toast-icon { background: rgba(201,169,110,.15); color: var(--gold, #C9A96E); }
    .roses-toast.info    .roses-toast-icon { background: rgba(59,130,246,.1);  color: #3b82f6; }

    /* Texto */
    .roses-toast-body { flex: 1; }
    .roses-toast-title {
      font-family: var(--font-heading, Georgia, serif);
      font-weight: 700;
      font-size: .82rem;
      letter-spacing: .04em;
      text-transform: uppercase;
      margin-bottom: .15rem;
      opacity: .55;
    }
    .roses-toast-msg { margin: 0; }

    /* Barra de progreso */
    .roses-toast-progress {
      position: absolute;
      bottom: 0; left: 0;
      height: 2px;
      background: currentColor;
      opacity: .25;
      animation: toastProgress linear forwards;
    }
    .roses-toast { position: relative; overflow: hidden; }

    /* Animaciones */
    @keyframes toastIn {
      from { opacity: 0; transform: translateX(40px) scale(.96); }
      to   { opacity: 1; transform: translateX(0)    scale(1);   }
    }
    @keyframes toastOut {
      from { opacity: 1; transform: translateX(0) scale(1);    max-height: 80px; margin-bottom: 0; }
      to   { opacity: 0; transform: translateX(40px) scale(.94); max-height: 0;   margin-bottom: -.65rem; }
    }
    @keyframes toastProgress {
      from { width: 100%; }
      to   { width: 0%; }
    }

    /* Responsive */
    @media (max-width: 480px) {
      #roses-toast-container { bottom: 1rem; right: 1rem; left: 1rem; }
      .roses-toast { min-width: unset; max-width: 100%; }
    }
  `;
  document.head.appendChild(style);
})();

/* ── Crear contenedor ── */
function getToastContainer() {
  let container = document.getElementById('roses-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'roses-toast-container';
    document.body.appendChild(container);
  }
  return container;
}

/* ── Íconos SVG por tipo ── */
const TOAST_ICONS = {
  success: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  error: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
  warning: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 3v6M8 11v1.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
  info: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 7v5M8 4.5V4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
};

const TOAST_TITLES = {
  success: 'Listo',
  error:   'Error',
  warning: 'Atención',
  info:    'Info',
};

/* ── Función principal ── */
function showToast(message, type = 'success', duration = 3500) {
  const container = getToastContainer();

  const toast = document.createElement('div');
  toast.className = `roses-toast ${type}`;

  toast.innerHTML = `
    <div class="roses-toast-icon">${TOAST_ICONS[type] || TOAST_ICONS.info}</div>
    <div class="roses-toast-body">
      <p class="roses-toast-title">${TOAST_TITLES[type] || type}</p>
      <p class="roses-toast-msg">${message}</p>
    </div>
    <div class="roses-toast-progress" style="animation-duration: ${duration}ms;"></div>
  `;

  container.appendChild(toast);

  // Auto-remove
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 320);
  }, duration);
}

/* ── Helpers semánticos ── */
const toast = {
  success: (msg, dur)  => showToast(msg, 'success', dur),
  error:   (msg, dur)  => showToast(msg, 'error',   dur || 4500),
  warning: (msg, dur)  => showToast(msg, 'warning', dur),
  info:    (msg, dur)  => showToast(msg, 'info',    dur),
};

/* ── Sobreescribir window.alert ──
   Cualquier alert() en cualquier archivo se convierte
   automáticamente en un toast sin tocar nada más.        */
window.alert = function(message) {
  const msg = String(message);
  // Detectar si es un error o confirmación negativa por palabras clave
  const isError = /error|inválid|requier|selecciona|agrega|completa|válido/i.test(msg);
  showToast(msg, isError ? 'error' : 'success');
};

function showConfirm(message, onConfirm) {
  const existing = document.getElementById('roses-confirm-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'roses-confirm-overlay';
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:99998;
    background:rgba(0,0,0,0.45);backdrop-filter:blur(3px);
    display:flex;align-items:center;justify-content:center;padding:1rem;
  `;

  overlay.innerHTML = `
    <div style="
      background:#fff;border-radius:16px;padding:2rem;
      max-width:380px;width:100%;
      box-shadow:0 24px 64px rgba(0,0,0,0.18);
      font-family:var(--font-body,'DM Sans',sans-serif);
      text-align:center;
    ">
      <div style="
        width:52px;height:52px;border-radius:50%;
        background:rgba(220,38,38,0.08);color:#dc2626;
        display:flex;align-items:center;justify-content:center;
        font-size:1.4rem;margin:0 auto 1.25rem;
      ">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <p style="font-size:1rem;font-weight:600;color:#1a202c;margin:0 0 0.5rem;">${message}</p>
      <p style="font-size:0.82rem;color:#888;margin:0 0 1.75rem;">Esta acción no se puede deshacer.</p>
      <div style="display:flex;gap:0.75rem;justify-content:center;">
        <button id="confirmCancel" style="
          flex:1;padding:0.65rem 1rem;border:1.5px solid #e2e8f0;
          border-radius:10px;background:#fff;color:#555;
          font-size:0.88rem;font-weight:500;cursor:pointer;
          font-family:inherit;transition:all 0.2s;
        ">Cancelar</button>
        <button id="confirmOk" style="
          flex:1;padding:0.65rem 1rem;border:none;
          border-radius:10px;background:#dc2626;color:#fff;
          font-size:0.88rem;font-weight:600;cursor:pointer;
          font-family:inherit;transition:all 0.2s;
        ">Eliminar</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  const close = () => { overlay.remove(); document.body.style.overflow = ''; };

  overlay.querySelector('#confirmCancel').onclick = close;
  overlay.querySelector('#confirmOk').onclick = () => { close(); onConfirm(); };
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
}