/* ========================================
   ANIMATIONS.JS - ANIMACIONES Y EFECTOS GENERALES
   ======================================== */

/* ===============================================
   SCROLL REVEAL ANIMATION
   =============================================== */

function revealOnScroll() {
  const reveals = document.querySelectorAll('.scroll-reveal');
  reveals.forEach(element => {
    const windowHeight = window.innerHeight;
    const revealTop = element.getBoundingClientRect().top;
    if (revealTop < windowHeight - 100) {
      element.classList.add('visible');
    }
  });
}

window.addEventListener('scroll', revealOnScroll);

// Ejecutar al cargar
document.addEventListener('DOMContentLoaded', revealOnScroll);

/* ===============================================
   HEADER SCROLL EFFECT
   =============================================== */

document.addEventListener('DOMContentLoaded', () => {
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
});

/* ===============================================
   MOBILE MENU TOGGLE
   =============================================== */

document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');
  
  if (hamburger && nav) {
    // Toggle menu al hacer clic en hamburger
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      nav.classList.toggle('active');
    });
    
    // Cerrar menu al hacer clic en un enlace
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        nav.classList.remove('active');
      });
    });
  }
});

/* ===============================================
   MODAL CLOSE ON OVERLAY CLICK
   =============================================== */

document.addEventListener('DOMContentLoaded', () => {
  const modalOverlay = document.getElementById('modalOverlay');
  
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      // Solo cerrar si se hace clic en el overlay, no en el modal
      if (e.target === modalOverlay) {
        closeModal();
      }
    });
  }
});
