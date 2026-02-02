// Script específico para productDetail.html

document.addEventListener('DOMContentLoaded', async () => {
  const productLayout = document.getElementById('product-layout');
  const detailSections = document.getElementById('detail-sections');
  
  // Obtener ID del producto desde URL
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  
  if (!productId) {
    productLayout.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px;"><p>Producto no encontrado. <a href="products.html">Volver al catálogo</a></p></div>';
    return;
  }
  
  // Mostrar estado de carga
  productLayout.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
      <div style="margin-bottom: 16px;">⏳</div>
      <p>Cargando producto...</p>
    </div>
  `;
  
  // Cargar productos desde la API serverless
  let products = [];
  
  try {
    // Cargar desde la nueva API serverless
    products = await apiClient.getCatalogo();
    
    if (!products || products.length === 0) {
      productLayout.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
          <div style="margin-bottom: 16px;">📭</div>
          <p>No se encontraron productos en el catálogo.</p>
          <a href="products.html" style="margin-top: 16px; display: inline-block; color: var(--accent-blue);">Volver al catálogo</a>
        </div>
      `;
      return;
    }
    
    // Buscar producto por ID
    const product = products.find(p => p.id == productId || p.id === productId);
    
    if (!product) {
      productLayout.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px;"><p>Producto no encontrado. <a href="products.html">Volver al catálogo</a></p></div>';
      return;
    }
    
    // Renderizar producto
    const rendered = productRenderer.renderProductDetail(product);
    productLayout.innerHTML = rendered.gallery + rendered.info;
    detailSections.innerHTML = rendered.specs + rendered.description;
    
    // Actualizar título de la página
    document.title = `${product.marca} ${product.modelo} | ChingaTech Store`;
    
    // Configurar galería de imágenes
    setupGallery(product);
    
    // Configurar eventos
    setupEventListeners(product);
    
  } catch (error) {
    console.error('Error cargando producto:', error);
    
    // Mostrar mensaje de error específico
    let errorMessage = 'Error cargando producto. Por favor, intenta nuevamente más tarde.';
    
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      errorMessage = 'Error de conexión. Verifica tu conexión a internet e intenta nuevamente.';
    } else if (error.message.includes('401') || error.message.includes('autenticación')) {
      errorMessage = 'Error de configuración del servidor. Contacta al administrador.';
    } else if (error.message.includes('404')) {
      errorMessage = 'No se encontró el catálogo. Verifica la configuración.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    productLayout.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
        <div style="margin-bottom: 16px; font-size: 48px;">⚠️</div>
        <p style="margin-bottom: 8px; font-weight: 600;">Error al cargar producto</p>
        <p style="color: #666; font-size: 0.9rem; margin-bottom: 16px;">${errorMessage}</p>
        <a href="products.html" style="display: inline-block; margin-right: 8px; padding: 8px 16px; background: var(--accent-blue); color: white; text-decoration: none; border-radius: 4px;">
          Volver al catálogo
        </a>
        <button onclick="location.reload()" style="padding: 8px 16px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Reintentar
        </button>
      </div>
    `;
  }
});

function setupGallery(product) {
  const mainImage = document.getElementById('main-gallery-image');
  const thumbs = document.querySelectorAll('.gallery-thumbs .thumb');
  
  if (!mainImage || !thumbs.length) return;
  
  const images = product.fotosArray || [];
  
  thumbs.forEach((thumb, index) => {
    thumb.addEventListener('click', function() {
      // Remover clase activa de todos
      thumbs.forEach(t => t.classList.remove('is-active'));
      // Agregar clase activa al clickeado
      this.classList.add('is-active');
      
      // Cambiar imagen principal
      if (images[index]) {
        mainImage.style.setProperty('--main-image', `url('${images[index]}')`);
        mainImage.style.background = '#fff';
        mainImage.textContent = '';
      }
    });
  });
}

function setupEventListeners(product) {
  // Botón comprar por WhatsApp
  const whatsappBtn = document.getElementById('whatsapp-btn');
  if (whatsappBtn) {
    whatsappBtn.addEventListener('click', function() {
      redirectToWhatsApp(product, CONFIG.whatsappNumber);
    });
  }
}

// Función para redirigir a WhatsApp
function redirectToWhatsApp(product, whatsappNumber) {
  const modeloStr = String(product.modelo || 'Producto');
  const marcaStr = String(product.marca || '');
  const precio = CONFIG.defaultCurrency === 'usd' ? product.contado_usd : product.contado_ars;
  const precioFormateado = precio ? precio.toLocaleString('es-AR') : 'Consultar';
  const moneda = CONFIG.defaultCurrency === 'usd' ? 'USD' : 'ARS';
  
  const mensaje = `Hola! Me interesa el ${marcaStr} ${modeloStr}. Precio: $${precioFormateado} ${moneda}`;
  const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');
}
