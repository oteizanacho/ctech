// Script específico para products.html

// Marcas disponibles
const MARCAS_DISPONIBLES = ['Apple', 'Xiaomi', 'Samsung', 'Motorola', 'Sony', 'Nintendo'];

document.addEventListener('DOMContentLoaded', async () => {
  const productsContainer = document.getElementById('products-container');
  
  // Mostrar estado de carga
  productsContainer.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
      <div style="margin-bottom: 16px;">⏳</div>
      <p>Cargando productos...</p>
    </div>
  `;
  
  // Obtener parámetros de URL
  const urlParams = new URLSearchParams(window.location.search);
  const marcaParam = urlParams.get('marca');
  const categoriaParam = urlParams.get('categoria');
  
  // Cargar productos desde la API serverless
  let products = [];
  
  try {
    // Intentar cargar desde la nueva API serverless
    products = await apiClient.getCatalogo();
    
    if (!products || products.length === 0) {
      productsContainer.innerHTML = `
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
        // Normalizar nombres de marcas conocidas
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
    
    // Filtrar productos por categoría si existe el parámetro
    if (categoriaParam) {
      products = filterByCategory(products, categoriaParam);
    }
    
    // Filtrar productos que no tienen precio
    products = filterProductsWithPrice(products);
    
    // Extraer marcas únicas disponibles
    const marcas = extractMarcas(products);
    
    // Generar botones de marcas dinámicamente
    generateMarcaFilters(marcas);
    
    // Renderizar productos por marca
    if (marcaParam && marcaParam !== 'todos') {
      renderMarcaView(marcaParam, products);
    } else {
      renderAllMarcasView(products);
    }
    
    // Marcar filtro activo
    document.querySelectorAll('.filter-chip').forEach(chip => {
      chip.classList.remove('is-active');
      const marcaValue = chip.getAttribute('data-marca');
      
      if (marcaParam) {
        if (marcaValue === marcaParam) {
          chip.classList.add('is-active');
        }
      } else if (marcaValue === 'todos') {
        chip.classList.add('is-active');
      }
    });
    
    // Agregar event listeners
    setupEventListeners();
    
  } catch (error) {
    console.error('Error cargando productos:', error);
    
    // Mostrar mensaje de error específico
    let errorMessage = 'Error cargando productos. Por favor, intenta nuevamente más tarde.';
    
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      errorMessage = 'Error de conexión. Verifica tu conexión a internet e intenta nuevamente.';
    } else if (error.message.includes('401') || error.message.includes('autenticación')) {
      errorMessage = 'Error de configuración del servidor. Contacta al administrador.';
    } else if (error.message.includes('404')) {
      errorMessage = 'No se encontró el catálogo. Verifica la configuración.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    productsContainer.innerHTML = `
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

// Verificar si un producto tiene precio
function hasPrice(product) {
  if (CONFIG.defaultCurrency === 'usd') {
    return product.contado_usd && parseFloat(product.contado_usd) > 0;
  } else {
    return product.contado_ars && parseFloat(product.contado_ars) > 0;
  }
}

// Filtrar productos que tienen precio
function filterProductsWithPrice(products) {
  return products.filter(product => hasPrice(product));
}

// Filtrar productos por categoría
function filterByCategory(products, categoria) {
  switch(categoria) {
    case 'fotografia-pro':
      // Mostrar todos los productos Apple con camara_principal >= 48
      // Y del resto de productos, solo los que superen 51 en camara_principal
      return products.filter(product => {
        const camara = parseFloat(product.camara_principal) || 0;
        const marca = (product.marca || '').toLowerCase();
        
        if (marca === 'apple') {
          return camara >= 48;
        } else {
          return camara > 51;
        }
      });
      
    case 'gaming-mode':
      // Productos que superen el valor 1400x2300 en resolucion
      return products.filter(product => {
        const resolucion = product.resolucion || '';
        if (!resolucion) return false;
        
        // Parsear resolución (formato esperado: "1400x2300" o similar)
        const match = resolucion.toString().match(/(\d+)\s*x\s*(\d+)/i);
        if (!match) return false;
        
        const ancho = parseInt(match[1]);
        const alto = parseInt(match[2]);
        
        // Comparar: debe superar 1400x2300 (comparar área total o ambos valores)
        // Interpretamos "superar" como tener mayor área total
        const areaProducto = ancho * alto;
        const areaMinima = 1400 * 2300;
        
        return areaProducto > areaMinima;
      });
      
    case 'bateria-infinita':
      // Productos que superen el valor 5000 en bateria_capacidad
      return products.filter(product => {
        const bateria = parseFloat(product.bateria_capacidad) || 0;
        return bateria > 5000;
      });
      
    case 'compactos':
      // Productos que tengan tamano_pantalla igual a 6.1
      return products.filter(product => {
        const tamano = parseFloat(product.tamano_pantalla) || 0;
        return tamano === 6.1;
      });
      
    default:
      return products;
  }
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

// Renderizar vista de todas las marcas (sliders por marca)
function renderAllMarcasView(products) {
  const productsContainer = document.getElementById('products-container');
  const marcas = extractMarcas(products);
  
  // Remover clase de marca filtrada
  productsContainer.classList.remove('marca-filtered');
  
  let html = '';
  
  marcas.forEach(marca => {
    const productosMarca = products.filter(p => p.marca === marca);
    if (productosMarca.length > 0) {
      html += renderMarcaSlider(marca, productosMarca);
    }
  });
  
  productsContainer.innerHTML = html || '<div style="grid-column: 1 / -1; text-align: center; padding: 40px;"><p>No hay productos disponibles.</p></div>';
  
  // Agregar event listeners a los sliders
  setupSliderNavigation();
}

// Renderizar vista de una marca específica
function renderMarcaView(marca, products) {
  const productsContainer = document.getElementById('products-container');
  const marcaNormalizada = MARCAS_DISPONIBLES.find(m => 
    m.toLowerCase() === marca.toLowerCase()
  ) || (marca.toLowerCase() === 'otros' ? 'Otros' : null);
  
  if (!marcaNormalizada) {
    productsContainer.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px;"><p>Marca no encontrada.</p></div>';
    productsContainer.classList.remove('marca-filtered');
    return;
  }
  
  const productosMarca = products.filter(p => p.marca === marcaNormalizada);
  
  if (productosMarca.length === 0) {
    productsContainer.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 40px;"><p>No hay productos de ${marcaNormalizada}.</p></div>`;
    productsContainer.classList.remove('marca-filtered');
    return;
  }
  
  // Marcar contenedor como filtrado por marca
  productsContainer.classList.add('marca-filtered');
  
  productsContainer.innerHTML = renderMarcaList(marcaNormalizada, productosMarca);
}

// Renderizar lista vertical de productos de una marca (cuando se filtra)
function renderMarcaList(marca, productos) {
  // Ordenar productos por precio de mayor a menor
  const productosOrdenados = [...productos].sort((a, b) => {
    // Usar el precio según la moneda configurada
    const precioA = CONFIG.defaultCurrency === 'usd' 
      ? (a.contado_usd || 0) 
      : (a.contado_ars || 0);
    const precioB = CONFIG.defaultCurrency === 'usd' 
      ? (b.contado_usd || 0) 
      : (b.contado_ars || 0);
    return precioB - precioA; // Orden descendente (mayor a menor)
  });
  
  const productosHtml = productosOrdenados.map(product => {
    const image = productRenderer.getMainImage(product);
    const modeloStr = String(product.modelo || 'Producto');
    const marcaStr = String(product.marca || '');
    
    // Usar CSS variable para la imagen con margen blanco
    let imageStyle = '';
    if (image) {
      imageStyle = `--slider-image: url('${image}'); background: #fff;`;
    } else {
      imageStyle = 'background: linear-gradient(135deg, #e8f0ff, #c9d8ff);';
    }
    
    // Resumen del producto (sin precio)
    const specs = [];
    if (product.ram) specs.push(`${product.ram}GB RAM`);
    if (product.memoria_interna) specs.push(`${product.memoria_interna}GB`);
    if (product.tamano_pantalla) specs.push(`${product.tamano_pantalla}"`);
    if (product.camara_principal) specs.push(`${product.camara_principal}MP`);
    
    return `
      <div class="slider-product-card marca-list-item" data-product-id="${product.id}">
        <div class="slider-product-image" style="${imageStyle}">
          ${!image ? modeloStr : ''}
        </div>
        <div class="slider-product-info">
          <div class="slider-product-name">${modeloStr}</div>
          <div class="slider-product-brand">${marcaStr}</div>
          ${specs.length > 0 ? `<div class="slider-product-specs">${specs.join(' · ')}</div>` : ''}
        </div>
      </div>
    `;
  }).join('');
  
  return `
    <div class="marca-list-section">
      <div class="marca-slider-header">
        <h2 class="marca-slider-title">${marca}</h2>
        <span class="marca-slider-count">${productos.length} ${productos.length === 1 ? 'producto' : 'productos'}</span>
      </div>
      <div class="marca-list-container">
        ${productosHtml}
      </div>
    </div>
  `;
}

// Renderizar slider de una marca (para vista "todos")
function renderMarcaSlider(marca, productos) {
  // Ordenar productos por precio de mayor a menor
  const productosOrdenados = [...productos].sort((a, b) => {
    // Usar el precio según la moneda configurada
    const precioA = CONFIG.defaultCurrency === 'usd' 
      ? (a.contado_usd || 0) 
      : (a.contado_ars || 0);
    const precioB = CONFIG.defaultCurrency === 'usd' 
      ? (b.contado_usd || 0) 
      : (b.contado_ars || 0);
    return precioB - precioA; // Orden descendente (mayor a menor)
  });
  
  // Limitar a 20 productos inicialmente
  const PRODUCTOS_LIMITE = 20;
  const productosMostrados = productosOrdenados.slice(0, PRODUCTOS_LIMITE);
  const hayMasProductos = productosOrdenados.length > PRODUCTOS_LIMITE;
  const marcaId = marca.toLowerCase().replace(/\s+/g, '-');
  
  const productosHtml = productosMostrados.map(product => {
    const image = productRenderer.getMainImage(product);
    const modeloStr = String(product.modelo || 'Producto');
    const marcaStr = String(product.marca || '');
    
    // Usar CSS variable para la imagen con margen blanco
    let imageStyle = '';
    if (image) {
      imageStyle = `--slider-image: url('${image}'); background: #fff;`;
    } else {
      imageStyle = 'background: linear-gradient(135deg, #e8f0ff, #c9d8ff);';
    }
    
    // Resumen del producto (sin precio)
    const specs = [];
    if (product.ram) specs.push(`${product.ram}GB RAM`);
    if (product.memoria_interna) specs.push(`${product.memoria_interna}GB`);
    if (product.tamano_pantalla) specs.push(`${product.tamano_pantalla}"`);
    if (product.camara_principal) specs.push(`${product.camara_principal}MP`);
    
    return `
      <div class="slider-product-card" data-product-id="${product.id}">
        <div class="slider-product-image" style="${imageStyle}">
          ${!image ? modeloStr : ''}
        </div>
        <div class="slider-product-info">
          <div class="slider-product-name">${modeloStr}</div>
          <div class="slider-product-brand">${marcaStr}</div>
          ${specs.length > 0 ? `<div class="slider-product-specs">${specs.join(' · ')}</div>` : ''}
        </div>
      </div>
    `;
  }).join('');
  
  // Generar HTML de productos adicionales (ocultos inicialmente)
  const productosAdicionalesHtml = hayMasProductos ? productosOrdenados.slice(PRODUCTOS_LIMITE).map(product => {
    const image = productRenderer.getMainImage(product);
    const modeloStr = String(product.modelo || 'Producto');
    const marcaStr = String(product.marca || '');
    
    let imageStyle = '';
    if (image) {
      imageStyle = `--slider-image: url('${image}'); background: #fff;`;
    } else {
      imageStyle = 'background: linear-gradient(135deg, #e8f0ff, #c9d8ff);';
    }
    
    const specs = [];
    if (product.ram) specs.push(`${product.ram}GB RAM`);
    if (product.memoria_interna) specs.push(`${product.memoria_interna}GB`);
    if (product.tamano_pantalla) specs.push(`${product.tamano_pantalla}"`);
    if (product.camara_principal) specs.push(`${product.camara_principal}MP`);
    
    return `
      <div class="slider-product-card marca-expanded-item" data-product-id="${product.id}" style="display: none;">
        <div class="slider-product-image" style="${imageStyle}">
          ${!image ? modeloStr : ''}
        </div>
        <div class="slider-product-info">
          <div class="slider-product-name">${modeloStr}</div>
          <div class="slider-product-brand">${marcaStr}</div>
          ${specs.length > 0 ? `<div class="slider-product-specs">${specs.join(' · ')}</div>` : ''}
        </div>
      </div>
    `;
  }).join('') : '';
  
  return `
    <div class="marca-slider-section" data-marca="${marcaId}">
      <div class="marca-slider-header">
        <h2 class="marca-slider-title">${marca}</h2>
        <span class="marca-slider-count">${productos.length} ${productos.length === 1 ? 'producto' : 'productos'}</span>
      </div>
      <div class="marca-slider-container">
        <button class="slider-nav slider-nav-prev" aria-label="Anterior">‹</button>
        <div class="marca-slider" data-marca="${marcaId}">
          ${productosHtml}
          ${productosAdicionalesHtml}
        </div>
        <button class="slider-nav slider-nav-next" aria-label="Siguiente">›</button>
      </div>
      ${hayMasProductos ? `
        <div class="marca-ver-mas-container">
          <button class="btn-ver-mas" data-marca="${marcaId}" data-expanded="false">
            Ver más (${productosOrdenados.length - PRODUCTOS_LIMITE} más)
          </button>
        </div>
      ` : ''}
    </div>
  `;
}

// Configurar navegación de sliders
function setupSliderNavigation() {
  document.querySelectorAll('.marca-slider-container').forEach(container => {
    const slider = container.querySelector('.marca-slider');
    const prevBtn = container.querySelector('.slider-nav-prev');
    const nextBtn = container.querySelector('.slider-nav-next');
    
    if (!slider || !prevBtn || !nextBtn) return;
    
    let scrollAmount = 0;
    const scrollStep = 300;
    
    prevBtn.addEventListener('click', () => {
      scrollAmount = Math.max(0, scrollAmount - scrollStep);
      slider.scrollTo({ left: scrollAmount, behavior: 'smooth' });
    });
    
    nextBtn.addEventListener('click', () => {
      const maxScroll = slider.scrollWidth - slider.clientWidth;
      scrollAmount = Math.min(maxScroll, scrollAmount + scrollStep);
      slider.scrollTo({ left: scrollAmount, behavior: 'smooth' });
    });
    
    // Actualizar visibilidad de botones según scroll
    const updateButtons = () => {
      scrollAmount = slider.scrollLeft;
      const maxScroll = slider.scrollWidth - slider.clientWidth;
      prevBtn.style.opacity = scrollAmount > 0 ? '1' : '0.3';
      nextBtn.style.opacity = scrollAmount < maxScroll ? '1' : '0.3';
    };
    
    slider.addEventListener('scroll', updateButtons);
    updateButtons();
  });
}

function setupEventListeners() {
  // Redirección a la vista de detalle al hacer click en tarjetas de producto del slider
  document.querySelectorAll('.slider-product-card').forEach(function (card) {
    card.addEventListener('click', function (event) {
      // Evitamos que los clicks en botones internos disparen la navegación
      if (event.target.closest('button')) return;
      const productId = card.getAttribute('data-product-id');
      window.location.href = `productDetail.html?id=${productId}`;
    });
  });
  
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
  
  // Botones "Ver más"
  document.querySelectorAll('.btn-ver-mas').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const marcaId = this.getAttribute('data-marca');
      const isExpanded = this.getAttribute('data-expanded') === 'true';
      const slider = document.querySelector(`.marca-slider[data-marca="${marcaId}"]`);
      const expandedItems = slider.querySelectorAll('.marca-expanded-item');
      
      if (isExpanded) {
        // Ocultar productos adicionales
        expandedItems.forEach(item => {
          item.style.display = 'none';
        });
        this.setAttribute('data-expanded', 'false');
        const count = expandedItems.length;
        this.textContent = `Ver más (${count} más)`;
      } else {
        // Mostrar productos adicionales
        expandedItems.forEach(item => {
          item.style.display = '';
        });
        this.setAttribute('data-expanded', 'true');
        this.textContent = 'Ver menos';
      }
      
      // Reconfigurar navegación del slider si es necesario
      setupSliderNavigation();
    });
  });
}
