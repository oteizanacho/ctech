// Configuración del proyecto
// IMPORTANTE: Configura aquí la URL de tu Google Sheet

const CONFIG = {
  // Opción 1: URL de Google Sheet publicada como CSV
  // Para publicar: Abre tu Google Sheet > Archivo > Compartir > Publicar en la web
  // Selecciona la hoja y el formato CSV, luego copia la URL
  sheetCSVUrl: '', // Ejemplo: 'https://docs.google.com/spreadsheets/d/ID/pub?output=csv'
  
  // Opción 2: URL de Google Sheet publicada como JSON (requiere Apps Script o SheetDB)
  sheetJSONUrl: '',
  
  // Opción 3: Google Sheets API (requiere API key)
  sheetId: '', // ID de tu Google Sheet (de la URL)
  apiKey: '', // Tu API key de Google Sheets API v4
  
  // Número de WhatsApp para redirección (formato: código país + número sin +)
  whatsappNumber: '5491123456789', // Ejemplo para Argentina: 5491123456789
  
  // Moneda por defecto para mostrar precios
  defaultCurrency: 'ars', // 'ars' o 'usd'
  
  // Método de carga preferido: 'csv', 'json', o 'api'
  loadMethod: 'csv'
};
