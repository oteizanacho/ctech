// Script específico para cart.html

document.addEventListener('DOMContentLoaded', async () => {
  const cartItemsContainer = document.getElementById('cart-items');
  const summarySubtotal = document.getElementById('summary-subtotal');
  const summaryTotal = document.getElementById('summary-total');
  const checkoutBtn = document.getElementById('checkout-btn');
  
  // Cargar productos desde Google Sheets primero
  let products = [];
  
  try {
    if (CONFIG.loadMethod === 'csv' && CONFIG.sheetCSVUrl) {
      products = await sheetsData.loadFromCSV(CONFIG.sheetCSVUrl);
    } else if (CONFIG.loadMethod === 'json' && CONFIG.sheetJSONUrl) {
      products = await sheetsData.loadFromJSON(CONFIG.sheetJSONUrl);
    } else if (CONFIG.loadMethod === 'api' && CONFIG.sheetId && CONFIG.apiKey) {
      products = await sheetsData.loadFromAPI(CONFIG.sheetId, CONFIG.apiKey);
    } else {
      console.warn('No se configuró la URL de Google Sheets. Configura CONFIG en js/config.js');
      cartItemsContainer.innerHTML = '<div style="text-align: center; padding: 40px;"><p>Por favor configura la URL de Google Sheets en js/config.js</p></div>';
      return;
    }
    
    // Obtener items del carrito
    const cartItems = cartManager.getCartItems();
    
    if (cartItems.length === 0) {
      cartItemsContainer.innerHTML = `
        <div style="text-align: center; padding: 40px;">
          <p style="margin-bottom: 20px;">Tu carrito está vacío</p>
          <a href="products.html" class="btn-primary">Ver productos</a>
        </div>
      `;
      updateSummary(0, 0);
      checkoutBtn.disabled = true;
      checkoutBtn.style.opacity = '0.5';
      return;
    }
    
    // Renderizar items del carrito
    cartItemsContainer.innerHTML = cartItems.map(item => 
      productRenderer.renderCartItem(item)
    ).join('');
    
    // Calcular totales
    const subtotal = cartManager.getTotal(CONFIG.defaultCurrency);
    const total = subtotal; // Sin descuentos por ahora
    
    // Actualizar resumen
    updateSummary(cartItems.length, subtotal, total);
    
    // Configurar eventos
    setupEventListeners();
    
    // Actualizar contador del carrito
    cartManager.updateCartCounter();
    
  } catch (error) {
    console.error('Error cargando carrito:', error);
    cartItemsContainer.innerHTML = '<div style="text-align: center; padding: 40px;"><p>Error cargando carrito. Revisa la consola para más detalles.</p></div>';
  }
});

function updateSummary(itemCount, subtotal, total) {
  const summarySubtotal = document.getElementById('summary-subtotal');
  const summaryTotal = document.getElementById('summary-total');
  
  if (summarySubtotal) {
    summarySubtotal.innerHTML = `
      <span>Subtotal productos (${itemCount})</span>
      <strong>${productRenderer.formatPrice(subtotal, CONFIG.defaultCurrency)}</strong>
    `;
  }
  
  if (summaryTotal) {
    summaryTotal.innerHTML = `
      <span>Total a pagar</span>
      <strong>${productRenderer.formatPrice(total, CONFIG.defaultCurrency)}</strong>
    `;
  }
}

function setupEventListeners() {
  // Botón quitar producto
  document.querySelectorAll('.remove-link').forEach(function(link) {
    link.addEventListener('click', function() {
      const productId = this.getAttribute('data-product-id');
      if (confirm('¿Estás seguro de que quieres quitar este producto del carrito?')) {
        cartManager.removeProduct(productId);
        // Recargar página para actualizar
        window.location.reload();
      }
    });
  });
  
  // Botón finalizar compra (WhatsApp)
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function() {
      const cartItems = cartManager.getCartItems();
      if (cartItems.length > 0) {
        cartManager.redirectToWhatsAppCart(CONFIG.whatsappNumber);
      }
    });
  }
}
