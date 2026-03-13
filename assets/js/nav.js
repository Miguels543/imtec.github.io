// Toggle nav móvil
const hamburger = document.querySelector('.hamburger');
const nav = document.querySelector('nav');
const body = document.body;

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  nav.classList.toggle('active');
  body.classList.toggle('nav-open');
});

// Cerrar al hacer click en un enlace
nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    nav.classList.remove('active');
    body.classList.remove('nav-open');
  });
});

// Cerrar al hacer click fuera del nav
document.addEventListener('click', (e) => {
  if (nav.classList.contains('active') && 
      !nav.contains(e.target) && 
      !hamburger.contains(e.target)) {
    hamburger.classList.remove('active');
    nav.classList.remove('active');
    body.classList.remove('nav-open');
  }
});