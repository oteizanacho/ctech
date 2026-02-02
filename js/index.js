// Script específico para index.html

document.addEventListener('DOMContentLoaded', async () => {
  const productsGrid = document.getElementById('products-grid');
  
  // Mostrar estado de carga
  productsGrid.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
      <div style="margin-bottom: 16px;">⏳</div>
      <p>Cargando productos destacados...</p>
    </div>
  `;
  
  // Cargar productos desde la API serverless
  let products = [];
  
  try {
    // Cargar desde la nueva API serverless
    products = await apiClient.getCatalogo();
    
    if (!products || products.length === 0) {
      productsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
          <div style="margin-bottom: 16px;">📭</div>
          <p>No se encontraron productos en el catálogo.</p>
        </div>
      `;
      return;
    }
    
    // Mostrar los primeros 8 productos destacados
    const featuredProducts = products.slice(0, 8);
    productsGrid.innerHTML = featuredProducts.map(product => 
      productRenderer.renderProductCard(product)
    ).join('');
    
    // Actualizar contador de productos
    const countChip = document.querySelector('.section-header .chip');
    if (countChip) {
      countChip.textContent = `Actualizado hoy · ${featuredProducts.length} modelos`;
    }
    
    // Agregar event listeners
    setupEventListeners();
    
  } catch (error) {
    console.error('Error cargando productos:', error);
    
    // Mostrar mensaje de error específico
    let errorMessage = 'Error cargando productos. Por favor, intenta nuevamente más tarde.';
    
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
    } else if (error.message.includes('401') || error.message.includes('autenticación')) {
      errorMessage = 'Error de configuración del servidor.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    productsGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
        <div style="margin-bottom: 16px; font-size: 48px;">⚠️</div>
        <p style="margin-bottom: 8px; font-weight: 600;">Error al cargar productos</p>
        <p style="color: #666; font-size: 0.9rem;">${errorMessage}</p>
        <button onclick="location.reload()" style="margin-top: 16px; padding: 8px 16px; background: var(--accent-blue); color: white; border: none; border-radius: 4px; cursor: pointer;">
          Reintentar
        </button>
      </div>
    `;
  }
});

function setupEventListeners() {
  // Redirección a la vista de detalle al hacer click en cualquier tarjeta de producto
  document.querySelectorAll('.product-card').forEach(function (card) {
    card.addEventListener('click', function (event) {
      // Evitamos que los clicks en botones internos disparen la navegación
      if (event.target.closest('button')) return;
      const productId = card.getAttribute('data-product-id');
      window.location.href = `productDetail.html?id=${productId}`;
    });
  });

  // Búsqueda y filtros
  const searchForm = document.querySelector('.search');
  if (searchForm) {
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const searchInput = searchForm.querySelector('input');
      const searchTerm = searchInput.value;
      window.location.href = `products.html?search=${encodeURIComponent(searchTerm)}`;
    });
  }
  
  // Filtros
  document.querySelectorAll('.filter-chip').forEach(function(chip) {
    chip.addEventListener('click', function() {
      const filter = this.textContent.trim();
      let url = 'products.html';
      
      if (filter === 'Gama alta') {
        url += '?gama=alta';
      } else if (filter === 'Gama media') {
        url += '?gama=media';
      } else if (filter === '+ 5G') {
        url += '?search=5G';
      } else if (filter === 'Ofertas') {
        url += '?ofertas=true';
      }
      
      if (filter !== 'Todos') {
        window.location.href = url;
      } else {
        window.location.href = 'products.html';
      }
    });
  });
}
