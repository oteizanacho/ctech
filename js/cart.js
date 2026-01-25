// Gestión del carrito usando localStorage

class CartManager {
  constructor() {
    this.cartKey = 'chingatech_cart';
    this.cart = this.loadCart();
  }

  // Cargar carrito desde localStorage
  loadCart() {
    try {
      const cartData = localStorage.getItem(this.cartKey);
      return cartData ? JSON.parse(cartData) : [];
    } catch (error) {
      console.error('Error cargando carrito:', error);
      return [];
    }
  }

  // Guardar carrito en localStorage
  saveCart() {
    try {
      localStorage.setItem(this.cartKey, JSON.stringify(this.cart));
      this.updateCartCounter();
    } catch (error) {
      console.error('Error guardando carrito:', error);
    }
  }

  // Agregar producto al carrito
  addProduct(productId, quantity = 1) {
    const existingItem = this.cart.find(item => item.id == productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cart.push({
        id: productId,
        quantity: quantity
      });
    }
    
    this.saveCart();
    return this.cart;
  }

  // Remover producto del carrito
  removeProduct(productId) {
    this.cart = this.cart.filter(item => item.id != productId);
    this.saveCart();
    return this.cart;
  }

  // Actualizar cantidad de un producto
  updateQuantity(productId, quantity) {
    const item = this.cart.find(item => item.id == productId);
    if (item) {
      if (quantity <= 0) {
        this.removeProduct(productId);
      } else {
        item.quantity = quantity;
        this.saveCart();
      }
    }
    return this.cart;
  }

  // Obtener todos los items del carrito con datos completos
  getCartItems() {
    return this.cart.map(cartItem => {
      const product = sheetsData.getProductById(cartItem.id);
      if (product) {
        return {
          ...product,
          quantity: cartItem.quantity
        };
      }
      return null;
    }).filter(item => item !== null);
  }

  // Obtener cantidad total de items
  getTotalItems() {
    return this.cart.reduce((total, item) => total + item.quantity, 0);
  }

  // Calcular total del carrito
  getTotal(currency = 'ars') {
    const items = this.getCartItems();
    return items.reduce((total, item) => {
      const price = currency === 'usd' ? item.contado_usd : item.contado_ars;
      return total + (price * item.quantity);
    }, 0);
  }

  // Limpiar carrito
  clearCart() {
    this.cart = [];
    this.saveCart();
  }

  // Actualizar contador en el header
  updateCartCounter() {
    const counters = document.querySelectorAll('.nav-cta');
    const totalItems = this.getTotalItems();
    counters.forEach(counter => {
      counter.textContent = `Mi carrito (${totalItems})`;
    });
  }

  // Generar mensaje de WhatsApp para compra
  generateWhatsAppMessage(product) {
    const price = CONFIG.defaultCurrency === 'usd' ? product.contado_usd : product.contado_ars;
    const priceFormatted = CONFIG.defaultCurrency === 'usd' 
      ? `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
      : `$${price.toLocaleString('es-AR')} ARS`;
    
    let message = `Hola! Me interesa comprar el ${product.marca} ${product.modelo}\n\n`;
    message += `Precio: ${priceFormatted}\n`;
    
    if (product.cuotas_12) {
      message += `12 cuotas: $${product.cuotas_12.toLocaleString('es-AR')} ARS\n`;
    }
    
    if (product.ram) message += `RAM: ${product.ram}GB\n`;
    if (product.memoria_interna) message += `Memoria: ${product.memoria_interna}GB\n`;
    
    return encodeURIComponent(message);
  }

  // Redirigir a WhatsApp
  redirectToWhatsApp(product, phoneNumber = '5491123456789') {
    const message = this.generateWhatsAppMessage(product);
    const url = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(url, '_blank');
  }

  // Redirigir a WhatsApp con múltiples productos (carrito)
  redirectToWhatsAppCart(phoneNumber = '5491123456789') {
    const items = this.getCartItems();
    let message = 'Hola! Me interesa comprar los siguientes celulares:\n\n';
    
    items.forEach((item, index) => {
      const price = CONFIG.defaultCurrency === 'usd' ? item.contado_usd : item.contado_ars;
      const priceFormatted = CONFIG.defaultCurrency === 'usd' 
        ? `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
        : `$${price.toLocaleString('es-AR')} ARS`;
      
      const subtotalPrice = price * item.quantity;
      const subtotalFormatted = CONFIG.defaultCurrency === 'usd' 
        ? `$${subtotalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
        : `$${subtotalPrice.toLocaleString('es-AR')} ARS`;
      
      message += `${index + 1}. ${item.marca} ${item.modelo}\n`;
      message += `   Cantidad: ${item.quantity}\n`;
      message += `   Precio unitario: ${priceFormatted}\n`;
      message += `   Subtotal: ${subtotalFormatted}\n\n`;
    });
    
    const total = this.getTotal(CONFIG.defaultCurrency);
    const totalFormatted = CONFIG.defaultCurrency === 'usd' 
      ? `$${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
      : `$${total.toLocaleString('es-AR')} ARS`;
    
    message += `TOTAL: ${totalFormatted}`;
    
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }
}

// Instancia global
const cartManager = new CartManager();

// Actualizar contador al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  cartManager.updateCartCounter();
});
