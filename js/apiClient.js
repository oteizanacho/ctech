// Cliente API para comunicarse con las funciones serverless de Vercel

class ApiClient {
  constructor() {
    // Determinar la URL base de la API
    // En desarrollo local: http://localhost:3000
    // En producción: usar la URL relativa /api
    this.baseUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3000/api' 
      : '/api';
    this.loading = false;
  }

  /**
   * Obtener el catálogo completo de productos desde Google Sheets
   * @returns {Promise<Array>} Array de productos
   */
  async getCatalogo() {
    try {
      this.loading = true;
      
      console.log('🔍 [Frontend] Iniciando solicitud a:', `${this.baseUrl}/catalogo`);
      console.log('🌐 [Frontend] URL base:', this.baseUrl);
      
      const response = await fetch(`${this.baseUrl}/catalogo`);
      
      console.log('📡 [Frontend] Respuesta recibida:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ [Frontend] Error en la respuesta:', errorData);
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ [Frontend] Datos recibidos:', {
        success: data.success,
        count: data.count,
        productosLength: data.productos?.length || 0
      });
      
      if (!data.success) {
        console.error('❌ [Frontend] Respuesta sin éxito:', data);
        throw new Error(data.message || 'Error al obtener el catálogo');
      }
      
      // Procesar productos para asegurar compatibilidad con el formato esperado
      console.log('🔄 [Frontend] Procesando productos...');
      const productos = (data.productos || []).map(producto => {
        // Procesar fotos - verificar si ya viene procesado desde la API
        if (!producto.fotosArray) {
          // Buscar en diferentes campos posibles
          const fotoFields = ['fotos', 'foto', 'imagen', 'imagenes', 'images', 'photo', 'photos', 'fotosarray', 'fotos_array'];
          let fotosString = null;
          
          for (const field of fotoFields) {
            if (producto[field]) {
              fotosString = producto[field];
              break;
            }
          }

          if (fotosString) {
            if (typeof fotosString === 'string') {
              producto.fotosArray = fotosString
                .split(/[,;]\s*|,\s*/)
                .map(f => f.trim())
                .filter(f => f && f.length > 0);
            } else if (Array.isArray(fotosString)) {
              producto.fotosArray = fotosString.map(f => String(f).trim()).filter(f => f && f.length > 0);
            } else {
              producto.fotosArray = [];
            }
          } else {
            producto.fotosArray = [];
          }
        }
        
        // Validar que las URLs de fotos sean válidas
        if (producto.fotosArray && producto.fotosArray.length > 0) {
          producto.fotosArray = producto.fotosArray.map(foto => {
            // Si la foto no tiene http/https, podría ser una URL relativa o inválida
            const trimmed = foto.trim();
            if (trimmed && (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('//'))) {
              return trimmed;
            }
            // Si no es una URL válida, retornar null para que se filtre
            return null;
          }).filter(f => f !== null);
          
          console.log(`📸 [Frontend] Fotos procesadas para ${producto.modelo}:`, producto.fotosArray);
        }
        
        // Asegurar que los campos numéricos sean números
        const numericFields = [
          'id', 'contado_usd', 'contado_ars', 'cuotas_6', 'cuotas_12',
          'tamano_pantalla', 'ram', 'memoria_interna', 'bateria_capacidad',
          'camara_principal', 'camara_secundaria'
        ];
        
        numericFields.forEach(field => {
          if (producto[field] !== undefined && producto[field] !== null && producto[field] !== '') {
            const numValue = parseFloat(producto[field]);
            if (!isNaN(numValue)) {
              producto[field] = numValue;
            }
          }
        });
        
        return producto;
      });
      
      console.log('✅ [Frontend] Productos procesados:', productos.length);
      
      // Imprimir todos los productos en consola para verificación
      console.log('📦 [Frontend] === LISTA COMPLETA DE PRODUCTOS ===');
      productos.forEach((producto, index) => {
        console.log(`\n📱 [Frontend] Producto ${index + 1}:`, {
          id: producto.id,
          modelo: producto.modelo,
          marca: producto.marca,
          precio_ars: producto.contado_ars,
          precio_usd: producto.contado_usd,
          ram: producto.ram,
          memoria_interna: producto.memoria_interna,
          fotos: producto.fotosArray,
          completo: producto
        });
      });
      console.log('📦 [Frontend] === FIN DE LISTA DE PRODUCTOS ===\n');
      
      return productos;
      
    } catch (error) {
      console.error('❌ [Frontend] Error al obtener catálogo desde API:', error);
      console.error('❌ [Frontend] Detalles del error:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw error;
    } finally {
      this.loading = false;
    }
  }
}

// Instancia global
const apiClient = new ApiClient();
