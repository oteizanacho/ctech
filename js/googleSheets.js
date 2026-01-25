// Configuración para leer datos de Google Sheets
// Opción 1: Si la hoja está publicada como CSV
// Opción 2: Si usas Google Sheets API (requiere API key)
// Opción 3: Si publicas la hoja como JSON (recomendado)

class GoogleSheetsData {
  constructor() {
    // Reemplaza esta URL con la URL de tu Google Sheet publicada como CSV o JSON
    // Para publicar: Archivo > Compartir > Publicar en la web > Formato: CSV o JSON
    this.sheetUrl = ''; // El usuario debe configurar esto
    this.products = [];
    this.loading = false;
  }

  // Método para cargar datos desde Google Sheets publicada como CSV
  async loadFromCSV(sheetUrl) {
    try {
      this.loading = true;
      const response = await fetch(sheetUrl);
      const csvText = await response.text();
      const products = this.parseCSV(csvText);
      this.products = products;
      return products;
    } catch (error) {
      console.error('Error cargando datos desde Google Sheets:', error);
      return [];
    } finally {
      this.loading = false;
    }
  }

  // Método para cargar datos desde Google Sheets publicada como JSON
  // Requiere usar una herramienta como SheetDB o hacer la hoja pública y usar Apps Script
  async loadFromJSON(jsonUrl) {
    try {
      this.loading = true;
      const response = await fetch(jsonUrl);
      const data = await response.json();
      this.products = Array.isArray(data) ? data : [];
      return this.products;
    } catch (error) {
      console.error('Error cargando datos desde JSON:', error);
      return [];
    } finally {
      this.loading = false;
    }
  }

  // Método para usar Google Sheets API v4 (requiere API key)
  async loadFromAPI(sheetId, apiKey, range = 'Sheet1!A1:Z1000') {
    try {
      this.loading = true;
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.values && data.values.length > 1) {
        const headers = data.values[0];
        const products = data.values.slice(1).map(row => {
          const product = {};
          headers.forEach((header, index) => {
            product[header] = row[index] || '';
          });
          return product;
        });
        this.products = products;
        return products;
      }
      return [];
    } catch (error) {
      console.error('Error cargando datos desde Google Sheets API:', error);
      return [];
    } finally {
      this.loading = false;
    }
  }

  // Parser simple de CSV
  parseCSV(csvText) {
    const lines = csvText.split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const products = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = this.parseCSVLine(lines[i]);
      if (values.length !== headers.length) continue;

      const product = {};
      headers.forEach((header, index) => {
        let value = values[index] || '';
        // Limpiar comillas si existen
        value = value.replace(/^"|"$/g, '');
        
        // Convertir números
        if (['id', 'contado_usd', 'contado_ars', 'cuotas_6', 'cuotas_12', 
             'tamano_pantalla', 'ram', 'memoria_interna', 'bateria_capacidad',
             'camara_principal', 'camara_secundaria'].includes(header)) {
          value = parseFloat(value) || 0;
        }
        
        product[header] = value;
      });
      
      // Procesar fotos (separadas por coma y espacio)
      if (product.fotos) {
        product.fotosArray = product.fotos.split(', ').filter(f => f.trim());
      } else {
        product.fotosArray = [];
      }

      products.push(product);
    }

    return products;
  }

  // Parser de línea CSV que maneja comas dentro de comillas
  parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    return values;
  }

  // Obtener todos los productos
  getAllProducts() {
    return this.products;
  }

  // Obtener producto por ID
  getProductById(id) {
    return this.products.find(p => p.id == id);
  }

  // Filtrar productos
  filterProducts(filters = {}) {
    let filtered = [...this.products];

    if (filters.marca) {
      filtered = filtered.filter(p => 
        p.marca.toLowerCase().includes(filters.marca.toLowerCase())
      );
    }

    if (filters.modelo) {
      filtered = filtered.filter(p => 
        p.modelo.toLowerCase().includes(filters.modelo.toLowerCase())
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.marca.toLowerCase().includes(searchLower) ||
        p.modelo.toLowerCase().includes(searchLower) ||
        (p.ram && p.ram.toString().includes(searchLower))
      );
    }

    if (filters.gama) {
      // Lógica para determinar gama basada en precio
      if (filters.gama === 'alta') {
        filtered = filtered.filter(p => p.contado_usd >= 800);
      } else if (filters.gama === 'media') {
        filtered = filtered.filter(p => p.contado_usd >= 400 && p.contado_usd < 800);
      }
    }

    return filtered;
  }
}

// Instancia global
const sheetsData = new GoogleSheetsData();
