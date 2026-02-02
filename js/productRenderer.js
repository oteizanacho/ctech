// Utilidades para renderizar productos en las vistas

class ProductRenderer {
  // Formatear precio
  formatPrice(amount, currency = 'ars') {
    if (currency === 'usd') {
      return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
    }
    return `$${amount.toLocaleString('es-AR')} ARS`;
  }

  // Obtener imagen principal del producto
  getMainImage(product) {
    if (product.fotosArray && product.fotosArray.length > 0) {
      const imageUrl = product.fotosArray[0].trim();
      // Validar que sea una URL válida
      if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('//'))) {
        const modeloStr = String(product.modelo || 'Producto');
        console.log(`🖼️ [Renderer] Imagen encontrada para ${modeloStr}:`, imageUrl);
        return imageUrl;
      } else {
        const modeloStr = String(product.modelo || 'Producto');
        console.warn(`⚠️ [Renderer] URL de imagen inválida para ${modeloStr}:`, imageUrl);
      }
    }
    const modeloStr = String(product.modelo || 'Producto');
    console.log(`⚠️ [Renderer] No hay imágenes para ${modeloStr}`);
    return null;
  }

  // Renderizar tarjeta de producto para grid
  renderProductCard(product) {
    const image = this.getMainImage(product);
    const price = CONFIG.defaultCurrency === 'usd' ? product.contado_usd : product.contado_ars;
    const installments = CONFIG.defaultCurrency === 'usd' 
      ? null 
      : (product.cuotas_12 ? `12 x $${Math.round(product.cuotas_12 / 12).toLocaleString('es-AR')}` : null);
    
    // Asegurar que modelo sea string
    const modeloStr = String(product.modelo || 'Producto');
    
    // Renderizar imagen con margen blanco
    let imageStyle = '';
    if (image) {
      imageStyle = `--product-image: url('${image}'); background: #fff;`;
    } else {
      imageStyle = 'background: linear-gradient(135deg, #e8f0ff, #c9d8ff);';
    }
    
    return `
      <article class="product-card" data-product-id="${product.id}">
        <div class="product-image" style="${imageStyle}">
          ${!image ? modeloStr : ''}
        </div>
        <div class="product-name">${modeloStr}</div>
        <div class="product-brand">${String(product.marca || '')}</div>
        <div class="product-price-row">
          <div>
            <div class="product-price">${this.formatPrice(price, CONFIG.defaultCurrency)}</div>
          </div>
          ${installments ? `<div class="product-installments">${installments}</div>` : ''}
        </div>
        <div class="product-tags">
          ${product.ram ? `<span class="product-tag">${product.ram}GB RAM</span>` : ''}
          ${product.memoria_interna ? `<span class="product-tag">${product.memoria_interna}GB</span>` : ''}
          ${product.tamano_pantalla ? `<span class="product-tag">${product.tamano_pantalla}"</span>` : ''}
        </div>
      </article>
    `;
  }

  // Renderizar detalle completo del producto
  renderProductDetail(product) {
    const images = product.fotosArray || [];
    const mainImage = images[0] || null;
    const price = CONFIG.defaultCurrency === 'usd' ? product.contado_usd : product.contado_ars;
    const oldPrice = price * 1.2; // Precio anterior simulado (20% más)
    const installments = CONFIG.defaultCurrency === 'usd' 
      ? null 
      : (product.cuotas_12 ? `Desde $${Math.round(product.cuotas_12 / 12).toLocaleString('es-AR')} / mes` : null);
    
    // Estilo para la imagen principal con margen blanco
    let mainImageStyle = '';
    if (mainImage) {
      // Usar CSS variable para la imagen y aplicar margen blanco con padding
      mainImageStyle = `--main-image: url('${mainImage}'); background: #fff;`;
    } else {
      mainImageStyle = 'background: linear-gradient(135deg, #ff9ec0, #ffdbe6);';
    }
    
    let galleryThumbs = '';
    images.forEach((img, index) => {
      const isActive = index === 0 ? 'is-active' : '';
      const thumbStyle = img 
        ? `--thumb-image: url('${img}'); background: #fff;`
        : '';
      galleryThumbs += `
        <div class="thumb ${isActive}" data-image-index="${index}" style="${thumbStyle}">
          ${!img ? `Vista ${index + 1}` : ''}
        </div>
      `;
    });
    
    if (galleryThumbs === '') {
      galleryThumbs = '<div class="thumb is-active">Frente</div><div class="thumb">Espalda</div><div class="thumb">Lado</div>';
    }

    return {
      gallery: `
        <article class="gallery-card neo-card">
          <div class="gallery-main" style="${mainImageStyle}" id="main-gallery-image">
            ${!mainImage ? product.modelo : ''}
          </div>
          <div class="gallery-thumbs">
            ${galleryThumbs}
          </div>
        </article>
      `,
      info: `
        <article class="product-info-card neo-card">
          <div class="product-label-row">
            <span class="product-brand-chip">${product.marca}</span>
          </div>
          <div>
            <h1 class="product-name">${product.modelo}${product.memoria_interna ? ` · ${product.memoria_interna} GB` : ''}${product.ram ? ` · ${product.ram} GB RAM` : ''}</h1>
            <p class="product-subtitle">
              ${this.buildProductDescription(product)}
            </p>
          </div>
          <div class="price-block">
            <div class="price-main">
              <div class="price-current">${this.formatPrice(price, CONFIG.defaultCurrency)}</div>
              
            </div>
            ${installments ? `
              <div class="price-installments">
                Hasta <strong>12 cuotas sin interés</strong><br />
                ${installments} con tarjeta
              </div>
            ` : ''}
          </div>
          <div class="product-options">
            ${product.memoria_interna ? `
              <div class="option-block">
                <div class="option-title">Memoria interna</div>
                <div class="option-list">
                  <span class="pill is-active">${product.memoria_interna} GB</span>
                </div>
              </div>
            ` : ''}
            <div class="option-block">
              <div class="option-title">Precios</div>
              <div class="option-list" style="flex-direction: column; align-items: flex-start; gap: 4px;">
                <div class="price-row" style="font-size: 0.75rem; display: flex; align-items: center; gap: 8px;">
                  <span>Contado: ${this.formatPrice(product.contado_ars, 'ars')}</span>
                  ${product.contado_ars ? `<button class="btn-copy-small" data-price="${product.contado_ars}" title="Copiar precio">📋</button>` : ''}
                </div>
                ${product.cuotas_6 ? `<div style="font-size: 0.75rem;">6 cuotas: ${this.formatPrice(product.cuotas_6, 'ars')}</div>` : ''}
                ${product.cuotas_12 ? `<div style="font-size: 0.75rem;">12 cuotas: ${this.formatPrice(product.cuotas_12, 'ars')}</div>` : ''}
              </div>
            </div>
          </div>
          <div class="product-actions">
            <div class="store-alias-section">
              <div class="alias-label">Alias de la tienda:</div>
              <div class="alias-value" id="store-alias" data-alias="chingatech.mp">
                <span>chingatech.mp</span>
                <button class="btn-copy" id="copy-alias-btn" title="Copiar alias">
                  📋
                </button>
              </div>
            </div>
            <button class="btn-primary" id="send-receipt-btn" data-product-id="${product.id}">
              Enviar comprobante
            </button>
          </div>
          <div class="product-meta-row">
            <span class="meta-item">Stock: disponible</span>
            <span class="meta-item">Envío 24h</span>
            <span class="meta-item">Garantía oficial 12 meses</span>
            <span class="meta-item">Devolución en 30 días</span>
          </div>
        </article>
      `,
      specs: `
        <article class="specs-card neo-card">
          <h2 class="section-title">
            <span class="section-badge"></span>
            Especificaciones técnicas
          </h2>
          <div class="specs-grid">
            ${product.tamano_pantalla ? `
              <div class="spec-item">
                <div class="spec-label">Pantalla</div>
                <div class="spec-value">${product.tamano_pantalla}"${product.resolucion ? ` · ${product.resolucion}` : ''}</div>
              </div>
            ` : ''}
            ${product.ram ? `
              <div class="spec-item">
                <div class="spec-label">Memoria RAM</div>
                <div class="spec-value">${product.ram} GB</div>
              </div>
            ` : ''}
            ${product.memoria_interna ? `
              <div class="spec-item">
                <div class="spec-label">Memoria interna</div>
                <div class="spec-value">${product.memoria_interna} GB</div>
              </div>
            ` : ''}
            ${product.camara_principal ? `
              <div class="spec-item">
                <div class="spec-label">Cámara principal</div>
                <div class="spec-value">${product.camara_principal}MP${product.camara_secundaria ? ` + ${product.camara_secundaria}MP` : ''}</div>
              </div>
            ` : ''}
            ${product.bateria_capacidad ? `
              <div class="spec-item">
                <div class="spec-label">Batería</div>
                <div class="spec-value">${product.bateria_capacidad}mAh</div>
              </div>
            ` : ''}
            <div class="spec-item">
              <div class="spec-label">Marca</div>
              <div class="spec-value">${product.marca}</div>
            </div>
            <div class="spec-item">
              <div class="spec-label">Modelo</div>
              <div class="spec-value">${product.modelo}</div>
            </div>
            ${product.contado_usd ? `
              <div class="spec-item">
                <div class="spec-label">Precio USD</div>
                <div class="spec-value">${this.formatPrice(product.contado_usd, 'usd')}</div>
              </div>
            ` : ''}
            ${product.contado_ars ? `
              <div class="spec-item">
                <div class="spec-label">Precio ARS</div>
                <div class="spec-value">${this.formatPrice(product.contado_ars, 'ars')}</div>
              </div>
            ` : ''}
          </div>
        </article>
      `,
      description: `
        <article class="description-card neo-card">
          <h2 class="section-title">
            <span class="section-badge" style="background:var(--accent-pink);"></span>
            Lo que hace especial a este modelo
          </h2>
          <p>
            El ${product.modelo} de ${product.marca} combina ${this.buildProductDescription(product)}.
          </p>
          <ul class="description-list">
            ${product.camara_principal ? `<li>Cámara principal de ${product.camara_principal}MP para fotos de alta calidad.</li>` : ''}
            ${product.bateria_capacidad ? `<li>Batería de ${product.bateria_capacidad}mAh para uso prolongado.</li>` : ''}
            ${product.ram ? `<li>${product.ram}GB de RAM para un rendimiento fluido.</li>` : ''}
            ${product.memoria_interna ? `<li>${product.memoria_interna}GB de almacenamiento interno.</li>` : ''}
          </ul>
        </article>
      `
    };
  }

  // Construir descripción del producto
  buildProductDescription(product) {
    const parts = [];
    if (product.tamano_pantalla) parts.push(`pantalla de ${product.tamano_pantalla}"`);
    if (product.camara_principal) parts.push(`cámara ${product.camara_principal}MP`);
    if (product.bateria_capacidad) parts.push(`batería ${product.bateria_capacidad}mAh`);
    return parts.join(', ') || 'características destacadas';
  }

}

// Instancia global
const productRenderer = new ProductRenderer();
