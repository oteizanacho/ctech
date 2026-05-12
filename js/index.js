// Script específico para index.html

// Marcas disponibles
const MARCAS_DISPONIBLES = ['Apple', 'Xiaomi', 'Samsung', 'Motorola', 'Sony', 'Nintendo'];

let heroCarouselInterval = null;
let currentHeroIndex = 0;
let heroProducts = [];

document.addEventListener('DOMContentLoaded', async () => {
  const productsGrid = document.getElementById('products-grid');
  const heroPhoneCard = document.getElementById('hero-phone-card');
  
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
    
    // Normalizar marcas de productos
    products = products.map(p => {
      if (!p.marca || p.marca.trim() === '') {
        p.marca = 'Otros';
      } else {
        const marcaLower = p.marca.trim();
        const marcaNormalizada = MARCAS_DISPONIBLES.find(m => 
          m.toLowerCase() === marcaLower.toLowerCase()
        );
        if (marcaNormalizada) {
          p.marca = marcaNormalizada;
        } else {
          p.marca = 'Otros';
        }
      }
      return p;
    });
    
    // Extraer marcas únicas disponibles
    const marcas = extractMarcas(products);
    
    // Generar botones de marcas dinámicamente
    generateMarcaFilters(marcas);
    
    // Filtrar productos que no tienen precio
    products = products.filter(product => {
      if (CONFIG.defaultCurrency === 'usd') {
        return product.contado_usd && parseFloat(product.contado_usd) > 0;
      } else {
        return product.contado_ars && parseFloat(product.contado_ars) > 0;
      }
    });
    
    // Seleccionar 6 productos de Apple para el hero
    heroProducts = selectHeroProducts(products);
    
    // Inicializar carrusel del hero
    if (heroProducts.length > 0) {
      renderHeroProduct(heroProducts[0]);
      startHeroCarousel();
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
  
  // Filtros de marca
  document.querySelectorAll('.filter-chip').forEach(function(chip) {
    chip.addEventListener('click', function() {
      const marca = this.getAttribute('data-marca');
      
      let url = 'products.html';
      if (marca && marca !== 'todos') {
        url += `?marca=${encodeURIComponent(marca)}`;
      }
      
      window.location.href = url;
    });
  });
  
  // Event listeners para categorías
  const categoryCards = document.querySelectorAll('.categories-row .category-card');
  categoryCards.forEach((card, index) => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', function() {
      const categoryName = this.querySelector('.category-name')?.textContent.trim();
      let categoryParam = '';
      
      // Mapear nombre de categoría a parámetro
      if (categoryName === 'Fotografía Pro') {
        categoryParam = 'fotografia-pro';
      } else if (categoryName === 'Gaming Mode') {
        categoryParam = 'gaming-mode';
      } else if (categoryName === 'Batería infinita') {
        categoryParam = 'bateria-infinita';
      } else if (categoryName === 'Compactos') {
        categoryParam = 'compactos';
      }
      
      if (categoryParam) {
        window.location.href = `products.html?categoria=${encodeURIComponent(categoryParam)}`;
      }
    });
  });
}

// Extraer marcas únicas de los productos
function extractMarcas(products) {
  const marcasSet = new Set();
  
  products.forEach(product => {
    const marca = product.marca;
    if (marca && marca.trim() !== '') {
      marcasSet.add(marca.trim());
    }
  });
  
  // Ordenar: primero las marcas conocidas en orden, luego "Otros"
  const marcasOrdenadas = [];
  MARCAS_DISPONIBLES.forEach(marca => {
    if (marcasSet.has(marca)) {
      marcasOrdenadas.push(marca);
      marcasSet.delete(marca);
    }
  });
  
  if (marcasSet.has('Otros')) {
    marcasOrdenadas.push('Otros');
    marcasSet.delete('Otros');
  }
  
  // Agregar cualquier otra marca que no esté en la lista
  Array.from(marcasSet).sort().forEach(marca => {
    marcasOrdenadas.push(marca);
  });
  
  return marcasOrdenadas;
}

// Generar botones de marcas dinámicamente
function generateMarcaFilters(marcas) {
  const filtersContainer = document.getElementById('filters-container');
  if (!filtersContainer) return;
  
  // Limpiar filtros existentes
  filtersContainer.innerHTML = '';
  
  // Agregar botón "Todos"
  const todosBtn = document.createElement('button');
  todosBtn.className = 'filter-chip is-active';
  todosBtn.type = 'button';
  todosBtn.setAttribute('data-marca', 'todos');
  todosBtn.textContent = 'Todos';
  filtersContainer.appendChild(todosBtn);
  
  // Agregar botones para cada marca
  marcas.forEach(marca => {
    const button = document.createElement('button');
    button.className = 'filter-chip';
    button.type = 'button';
    button.setAttribute('data-marca', marca.toLowerCase().replace(/\s+/g, '-'));
    button.textContent = marca;
    filtersContainer.appendChild(button);
  });
}

// Seleccionar 6 productos de Apple para el hero
function selectHeroProducts(products) {
  // Filtrar solo productos de Apple
  const appleProducts = products.filter(p => {
    const marca = p.marca || '';
    return marca.toLowerCase() === 'apple';
  });
  
  // Ordenar productos por precio (mayor a menor)
  const sortedProducts = [...appleProducts].sort((a, b) => {
    const precioA = CONFIG.defaultCurrency === 'usd' ? (a.contado_usd || 0) : (a.contado_ars || 0);
    const precioB = CONFIG.defaultCurrency === 'usd' ? (b.contado_usd || 0) : (b.contado_ars || 0);
    return precioB - precioA;
  });
  
  // Seleccionar los primeros 6 productos de Apple
  const selectedProducts = sortedProducts.slice(0, 6);
  
  return selectedProducts;
}

// Renderizar producto en el hero
function renderHeroProduct(product, withTransition = false) {
  const heroPhoneCard = document.getElementById('hero-phone-card');
  if (!heroPhoneCard) return;
  
  // Aplicar transición si se solicita
  if (withTransition) {
    heroPhoneCard.classList.add('fade-out');
    setTimeout(() => {
      updateHeroContent(product);
      heroPhoneCard.classList.remove('fade-out');
      heroPhoneCard.classList.add('fade-in');
      setTimeout(() => {
        heroPhoneCard.classList.remove('fade-in');
      }, 300);
    }, 150);
  } else {
    updateHeroContent(product);
  }
}

// Actualizar contenido del hero
function updateHeroContent(product) {
  const heroPhoneCard = document.getElementById('hero-phone-card');
  if (!heroPhoneCard) return;
  
  const image = productRenderer.getMainImage(product);
  const modeloStr = String(product.modelo || 'Producto');
  const marcaStr = String(product.marca || '');
  const price = CONFIG.defaultCurrency === 'usd' ? product.contado_usd : product.contado_ars;
  
  // Construir tagline con especificaciones
  const specs = [];
  if (product.tamano_pantalla) specs.push(`Pantalla ${product.tamano_pantalla}"`);
  if (product.camara_principal) specs.push(`Cámara ${product.camara_principal}MP`);
  if (product.bateria_capacidad) specs.push(`Batería ${product.bateria_capacidad}mAh`);
  const tagline = specs.length > 0 ? specs.join(' · ') : 'Especificaciones destacadas';
  
  // Especificaciones para mostrar
  const displaySpecs = [];
  if (product.memoria_interna) displaySpecs.push(`${product.memoria_interna} GB`);
  if (product.ram) displaySpecs.push(`${product.ram} GB RAM`);
  if (product.tamano_pantalla) displaySpecs.push(`${product.tamano_pantalla}"`);
  
  const imageStyle = image 
    ? `background-image: url('${image}'); background-size: cover; background-position: center;`
    : 'background: linear-gradient(135deg, #e8f0ff, #c9d8ff);';
  
  heroPhoneCard.innerHTML = `
    
    <div class="phone-info">
      <div class="phone-name">${modeloStr}</div>
      <div class="phone-tagline">${tagline}</div>
      <div class="phone-price">${productRenderer.formatPrice(price, CONFIG.defaultCurrency)}</div>
      <div class="phone-specs">
        ${displaySpecs.map(spec => `<span>${spec}</span>`).join('')}
      </div>
    </div>
    <div class="phone-image-frame">
      <div class="phone-image-placeholder" style="${imageStyle}">
        ${!image ? modeloStr : ''}
      </div>
    </div>
  `;
  
  // Hacer clickeable el hero card para ir al detalle
  heroPhoneCard.style.cursor = 'pointer';
  heroPhoneCard.onclick = () => {
    window.location.href = `productDetail.html?id=${product.id}`;
  };
}

// Iniciar carrusel automático del hero
function startHeroCarousel() {
  if (heroProducts.length <= 1) return;
  
  // Cambiar producto cada 5 segundos con transición
  heroCarouselInterval = setInterval(() => {
    currentHeroIndex = (currentHeroIndex + 1) % heroProducts.length;
    renderHeroProduct(heroProducts[currentHeroIndex], true); // Con transición
  }, 5000); // 5 segundos
}

// Detener carrusel (útil si se necesita)
function stopHeroCarousel() {
  if (heroCarouselInterval) {
    clearInterval(heroCarouselInterval);
    heroCarouselInterval = null;
  }
}
