// Carrusel
    const track = document.getElementById('carouselTrack');
    const slides = Array.from(track.children);
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const dotsWrap = document.getElementById('dots');
    let index = 0, timer;

    function renderDots(){
      dotsWrap.innerHTML = '';
      slides.forEach((_, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', 'Ir al slide ' + (i+1));
        if(i === index) b.setAttribute('aria-current', 'true');
        b.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(b);
      });
    }
    function goTo(i){
      index = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-index * 100) + '%)';
      renderDots(); restart();
    }
    function next(){ goTo(index + 1) }
    function prev(){ goTo(index - 1) }
    nextBtn.addEventListener('click', next);
    prevBtn.addEventListener('click', prev);

    function autoplay(){ timer = setInterval(next, 5000) }
    function stop(){ clearInterval(timer) }
    function restart(){ stop(); autoplay() }

    document.addEventListener('keydown', (e) => {
      if(e.key === 'ArrowRight') next();
      if(e.key === 'ArrowLeft') prev();
    });

    renderDots(); autoplay();



// Cambiar imagen principal
    function changeImage(src, thumbnail) {
      document.getElementById('mainImageSrc').src = src;
      document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
      thumbnail.classList.add('active');
    }

    // Cambiar tabs
    function switchTab(tabId, button) {
      // Ocultar todos los paneles
      document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
      });
      // Quitar active de todos los botones
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      // Mostrar el panel seleccionado
      document.getElementById(tabId).classList.add('active');
      // Activar el botón seleccionado
      button.classList.add('active');
    }



// Cambiar tabs
    function switchTab(tabId, button) {
      // Ocultar todos los paneles
      document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
      });
      // Quitar active de todos los botones
      document.querySelectorAll('.tab-nav-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      // Mostrar el panel seleccionado
      document.getElementById(tabId).classList.add('active');
      // Activar el botón seleccionado
      button.classList.add('active');
    }

    // Toggle switch
    function toggleSwitch(element) {
      element.classList.toggle('active');
    }


// Precios de los items
    const itemPrices = {
      'item1': 299999,
      'item2': 249999,
      'item3': 4999
    };

    // Cantidades actuales
    const quantities = {
      'item1': 1,
      'item2': 2,
      'item3': 3
    };

    let discount = 0;
    let discountPercentage = 0;

    // Actualizar cantidad
    function updateQuantity(itemId, change) {
      const currentQty = quantities[itemId] || 1;
      const newQty = Math.max(1, currentQty + change);
      quantities[itemId] = newQty;
      
      const qtyElement = document.getElementById('qty-' + itemId);
      if (qtyElement) {
        qtyElement.textContent = newQty;
      }
      
      updateTotals();
    }

    // Eliminar item
    function removeItem(itemId) {
      const item = document.querySelector(`[onclick*="'${itemId}'"]`).closest('.cart-item');
      if (item && confirm('¿Estás seguro de eliminar este producto del carrito?')) {
        item.remove();
        delete quantities[itemId];
        delete itemPrices[itemId];
        updateTotals();
        
        // Si no hay items, mostrar carrito vacío
        if (document.querySelectorAll('.cart-item').length === 0) {
          showEmptyCart();
        }
      }
    }

    // Aplicar cupón
    function applyCoupon() {
      const code = document.getElementById('couponCode').value.toUpperCase();
      
      if (code === 'DESCUENTO10') {
        discountPercentage = 10;
        discount = calculateSubtotal() * 0.1;
        alert('¡Cupón aplicado! Descuento del 10%');
        updateTotals();
      } else if (code === 'DESCUENTO20') {
        discountPercentage = 20;
        discount = calculateSubtotal() * 0.2;
        alert('¡Cupón aplicado! Descuento del 20%');
        updateTotals();
      } else if (code === '') {
        alert('Por favor ingresa un código de descuento');
      } else {
        alert('Código de descuento inválido');
      }
    }

    // Calcular subtotal
    function calculateSubtotal() {
      let subtotal = 0;
      for (const itemId in quantities) {
        if (itemPrices[itemId]) {
          subtotal += itemPrices[itemId] * quantities[itemId];
        }
      }
      return subtotal;
    }

    // Actualizar totales
    function updateTotals() {
      const subtotal = calculateSubtotal();
      const discountAmount = discount;
      const subtotalWithDiscount = subtotal - discountAmount;
      const taxes = subtotalWithDiscount * 0.12; // 12% de impuestos
      const total = subtotalWithDiscount + taxes;

      document.getElementById('subtotal').textContent = '$ ' + formatNumber(subtotal);
      document.getElementById('discount').textContent = discountAmount > 0 ? '- $ ' + formatNumber(discountAmount) : '$ 0';
      document.getElementById('taxes').textContent = '$ ' + formatNumber(Math.round(taxes));
      document.getElementById('total').textContent = '$ ' + formatNumber(Math.round(total));
    }

    // Formatear número
    function formatNumber(num) {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    // Mostrar carrito vacío
    function showEmptyCart() {
      const container = document.querySelector('.cart-container');
      container.innerHTML = `
        <div class="empty-cart">
          <div class="empty-cart-icon">🛒</div>
          <h2 class="empty-cart-title">Tu carrito está vacío</h2>
          <p class="empty-cart-text">¡Agrega productos increíbles a tu carrito!</p>
          <button class="btn" style="background: var(--accent); height: 56px; font-size: 1.1rem; padding: 0 2rem;" onclick="window.location.href='index.html'">
            Ir a Comprar
          </button>
        </div>
      `;
    }

    // Proceder al checkout
    function proceedToCheckout() {
      if (Object.keys(quantities).length === 0) {
        alert('Tu carrito está vacío. Agrega productos antes de continuar.');
        return;
      }
      alert('Redirigiendo al checkout...');
      // window.location.href = 'checkout.html';
    }

    // Inicializar totales
    updateTotals();

