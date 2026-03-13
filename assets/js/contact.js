// ========================================
// ROSES BIENESTAR - CONTACT FORM SCRIPT
// ========================================

document.addEventListener('DOMContentLoaded', function() {
  
  // Elementos del formulario
  const contactForm = document.getElementById('contactForm');
  const submitBtn = contactForm.querySelector('.btn-submit');
  const formSuccess = document.getElementById('formSuccess');
  
  // Campos del formulario
  const firstName = document.getElementById('firstName');
  const lastName = document.getElementById('lastName');
  const email = document.getElementById('email');
  const phone = document.getElementById('phone');
  const subject = document.getElementById('subject');
  const message = document.getElementById('message');
  const privacy = document.getElementById('privacy');

  // =======================================
  // VALIDACIÓN EN TIEMPO REAL
  // =======================================

  // Validar nombre
  firstName.addEventListener('blur', function() {
    validateField(firstName, 'firstNameError', value => value.trim().length >= 2, 'Por favor ingresa tu nombre');
  });

  firstName.addEventListener('input', function() {
    if (firstName.classList.contains('error')) {
      validateField(firstName, 'firstNameError', value => value.trim().length >= 2, 'Por favor ingresa tu nombre');
    }
  });

  // Validar apellido
  lastName.addEventListener('blur', function() {
    validateField(lastName, 'lastNameError', value => value.trim().length >= 2, 'Por favor ingresa tu apellido');
  });

  lastName.addEventListener('input', function() {
    if (lastName.classList.contains('error')) {
      validateField(lastName, 'lastNameError', value => value.trim().length >= 2, 'Por favor ingresa tu apellido');
    }
  });

  // Validar email
  email.addEventListener('blur', function() {
    validateField(email, 'emailError', validateEmail, 'Por favor ingresa un correo válido');
  });

  email.addEventListener('input', function() {
    if (email.classList.contains('error')) {
      validateField(email, 'emailError', validateEmail, 'Por favor ingresa un correo válido');
    }
  });

  // Validar asunto
  subject.addEventListener('change', function() {
    validateField(subject, 'subjectError', value => value !== '', 'Por favor selecciona un asunto');
  });

  // Validar mensaje
  message.addEventListener('blur', function() {
    validateField(message, 'messageError', value => value.trim().length >= 10, 'El mensaje debe tener al menos 10 caracteres');
  });

  message.addEventListener('input', function() {
    if (message.classList.contains('error')) {
      validateField(message, 'messageError', value => value.trim().length >= 10, 'El mensaje debe tener al menos 10 caracteres');
    }
  });

  // Validar checkbox de privacidad
  privacy.addEventListener('change', function() {
    validateField(privacy, 'privacyError', () => privacy.checked, 'Debes aceptar la política de privacidad');
  });

  // =======================================
  // FUNCIÓN DE VALIDACIÓN
  // =======================================

  function validateField(field, errorId, validationFn, errorMessage) {
    const errorElement = document.getElementById(errorId);
    const value = field.type === 'checkbox' ? field.checked : field.value;
    
    if (validationFn(value)) {
      field.classList.remove('error');
      errorElement.classList.remove('active');
      return true;
    } else {
      field.classList.add('error');
      errorElement.textContent = errorMessage;
      errorElement.classList.add('active');
      return false;
    }
  }

  // Validar email con regex
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // =======================================
  // ENVÍO DEL FORMULARIO
  // =======================================

  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validar todos los campos
    const isFirstNameValid = validateField(firstName, 'firstNameError', value => value.trim().length >= 2, 'Por favor ingresa tu nombre');
    const isLastNameValid = validateField(lastName, 'lastNameError', value => value.trim().length >= 2, 'Por favor ingresa tu apellido');
    const isEmailValid = validateField(email, 'emailError', validateEmail, 'Por favor ingresa un correo válido');
    const isSubjectValid = validateField(subject, 'subjectError', value => value !== '', 'Por favor selecciona un asunto');
    const isMessageValid = validateField(message, 'messageError', value => value.trim().length >= 10, 'El mensaje debe tener al menos 10 caracteres');
    const isPrivacyValid = validateField(privacy, 'privacyError', () => privacy.checked, 'Debes aceptar la política de privacidad');

    // Si todos los campos son válidos
    if (isFirstNameValid && isLastNameValid && isEmailValid && isSubjectValid && isMessageValid && isPrivacyValid) {
      // Deshabilitar botón y mostrar loading
      submitBtn.disabled = true;
      submitBtn.classList.add('loading');

      // Recopilar datos del formulario
      const formData = {
        firstName: firstName.value.trim(),
        lastName: lastName.value.trim(),
        email: email.value.trim(),
        phone: phone.value.trim(),
        subject: subject.options[subject.selectedIndex].text,
        message: message.value.trim()
      };

      // Simular envío (aquí puedes integrar con tu backend)
      sendFormData(formData);
    } else {
      // Hacer scroll al primer error
      const firstError = contactForm.querySelector('.error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
      }
    }
  });

  // =======================================
  // FUNCIÓN PARA ENVIAR DATOS
  // =======================================

  function sendFormData(data) {
    // Opción 1: Enviar por WhatsApp
    sendViaWhatsApp(data);

    // Opción 2: Enviar a tu servidor (descomenta si tienes backend)
    // sendToServer(data);
  }

  // Enviar mensaje por WhatsApp
  function sendViaWhatsApp(data) {
    const whatsappNumber = '51994379232';
    const whatsappMessage = `
🌿 *Nuevo mensaje de contacto - Roses Bienestar*

👤 *Nombre:* ${data.firstName} ${data.lastName}
📧 *Email:* ${data.email}
📱 *Teléfono:* ${data.phone || 'No proporcionado'}
📋 *Asunto:* ${data.subject}

💬 *Mensaje:*
${data.message}
    `.trim();

    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

    // Simular delay de envío
    setTimeout(() => {
      // Abrir WhatsApp
      window.open(whatsappURL, '_blank');

      // Mostrar mensaje de éxito
      showSuccessMessage();

      // Resetear formulario
      contactForm.reset();

      // Rehabilitar botón
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
    }, 1500);
  }

  // Enviar a servidor (ejemplo con fetch)
  function sendToServer(data) {
    fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
      if (result.success) {
        showSuccessMessage();
        contactForm.reset();
      } else {
        showErrorMessage(result.message || 'Error al enviar el mensaje');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      showErrorMessage('Error al enviar el mensaje. Por favor intenta nuevamente.');
    })
    .finally(() => {
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
    });
  }

  // =======================================
  // MENSAJES DE RETROALIMENTACIÓN
  // =======================================

  function showSuccessMessage() {
    formSuccess.style.display = 'flex';
    formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Ocultar mensaje después de 10 segundos
    setTimeout(() => {
      formSuccess.style.display = 'none';
    }, 10000);
  }

  function showErrorMessage(message) {
    // Crear elemento de error si no existe
    let errorMessage = document.getElementById('formError');
    
    if (!errorMessage) {
      errorMessage = document.createElement('div');
      errorMessage.id = 'formError';
      errorMessage.className = 'form-message error';
      errorMessage.innerHTML = `
        <span class="message-icon">✕</span>
        <p></p>
      `;
      formSuccess.parentNode.insertBefore(errorMessage, formSuccess.nextSibling);
    }

    errorMessage.querySelector('p').textContent = message;
    errorMessage.style.display = 'flex';
    errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Ocultar mensaje después de 8 segundos
    setTimeout(() => {
      errorMessage.style.display = 'none';
    }, 8000);
  }

  // =======================================
  // AUTO-FORMATO DE TELÉFONO
  // =======================================

  phone.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, ''); // Remover todo excepto números
    
    // Limitar a 9 dígitos (formato Perú)
    if (value.length > 9) {
      value = value.slice(0, 9);
    }

    // Formatear: 999 999 999
    if (value.length > 6) {
      value = value.slice(0, 3) + ' ' + value.slice(3, 6) + ' ' + value.slice(6);
    } else if (value.length > 3) {
      value = value.slice(0, 3) + ' ' + value.slice(3);
    }

    e.target.value = value ? '+51 ' + value : '';
  });

  // =======================================
  // CONTADOR DE CARACTERES PARA MENSAJE
  // =======================================

  const maxChars = 500;
  const messageCounter = document.createElement('div');
  messageCounter.className = 'char-counter';
  messageCounter.style.cssText = 'font-size: 0.85rem; color: var(--text-muted); text-align: right; margin-top: 0.25rem;';
  message.parentNode.appendChild(messageCounter);

  function updateCharCounter() {
    const remaining = maxChars - message.value.length;
    messageCounter.textContent = `${message.value.length} / ${maxChars} caracteres`;
    
    if (remaining < 50) {
      messageCounter.style.color = '#ff4757';
    } else {
      messageCounter.style.color = 'var(--text-muted)';
    }
  }

  message.addEventListener('input', function() {
    if (message.value.length > maxChars) {
      message.value = message.value.slice(0, maxChars);
    }
    updateCharCounter();
  });

  updateCharCounter();

  // =======================================
  // PREVENIR ENVÍO MÚLTIPLE
  // =======================================

  let isSubmitting = false;

  contactForm.addEventListener('submit', function(e) {
    if (isSubmitting) {
      e.preventDefault();
      return false;
    }
  });

  // =======================================
  // ANIMACIONES DE ENTRADA
  // =======================================

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observar elementos con animación
  document.querySelectorAll('.contact-method, .social-link, .form-group').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.6s ease-out';
    observer.observe(el);
  });

});

// =======================================
// ESTILOS ADICIONALES PARA MENSAJES
// =======================================

const style = document.createElement('style');
style.textContent = `
  .form-message.error {
    background-color: #f8d7da;
    border: 2px solid #dc3545;
    color: #721c24;
  }

  .char-counter {
    animation: fadeIn 0.3s ease-out;
  }
`;
document.head.appendChild(style);