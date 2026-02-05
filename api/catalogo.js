// API Route para obtener el catálogo de celulares desde Google Sheets
// Vercel Serverless Function

const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

module.exports = async (req, res) => {
  // Configurar CORS para permitir requests desde el frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Solo permitir método GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Obtener variables de entorno
    const sheetId = process.env.GOOGLE_SHEET_ID;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    //const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, '');

    // Validar que existan las variables de entorno
    if (!sheetId || !clientEmail || !privateKey) {
      console.error('❌ [API] Variables de entorno faltantes:', {
        sheetId: !!sheetId,
        clientEmail: !!clientEmail,
        privateKey: !!privateKey
      });
      return res.status(500).json({
        error: 'Configuración del servidor incompleta',
        message: 'Faltan variables de entorno necesarias para conectar con Google Sheets'
      });
    }

    // Inicializar la conexión con Google Sheets
    // En google-spreadsheet v4, se usa google-auth-library directamente
    const serviceAccountAuth = new JWT({
      email: clientEmail,
      key: privateKey,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file',
      ],
    });

    // Crear instancia del documento con autenticación
    const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);

    // Cargar información del documento
    await doc.loadInfo();

    // Obtener la primera pestaña (hoja)
    const sheet = doc.sheetsByIndex[0];
    
    if (!sheet) {
      console.error('❌ [API] No se encontró ninguna hoja en el documento');
      return res.status(404).json({
        error: 'No se encontró ninguna hoja en el documento'
      });
    }

    // Cargar las filas de la hoja
    const rows = await sheet.getRows();
    
    // Mostrar headers
    const headers = sheet.headerValues || [];

    // Extraer los datos y formatearlos
    const productos = rows.map((row, index) => {
      const producto = {};
      
      // Obtener todos los headers de la hoja
      const headers = sheet.headerValues || [];
      
      // Iterar sobre cada header y obtener su valor
      headers.forEach((header) => {
        if (header && header.trim() !== '') {
          // Limpiar el nombre del header (sin espacios, en minúsculas)
          const cleanHeader = header.trim().toLowerCase();
          
          // Obtener el valor usando el método get() de la librería
          let value = row.get(header);
          
          // Si get() no funciona, intentar acceso directo
          if (value === undefined || value === null) {
            value = row[header] || '';
          }
          /*
          // Convertir valores numéricos si es necesario
          if (typeof value === 'string' && value.trim() !== '') {
            // Intentar convertir a número si parece ser numérico
            // Remover caracteres no numéricos excepto punto y guión
            const cleanedValue = value.replace(/[^\d.-]/g, '');
            if (cleanedValue !== '') {
              const numValue = parseFloat(cleanedValue);
              if (!isNaN(numValue) && cleanedValue === numValue.toString()) {
                value = numValue;
              }
            }
          }
          */
          producto[cleanHeader] = value;
        }
      });

      // Agregar un ID único si no existe
      if (!producto.id) {
        producto.id = index + 1;
      }

      // Procesar fotos/imágenes - buscar en diferentes posibles nombres de columnas
      const fotoFields = ['fotos', 'foto', 'imagen', 'imagenes', 'images', 'photo', 'photos', 'fotosarray', 'fotos_array'];
      let fotosString = null;
      
      for (const field of fotoFields) {
        if (producto[field]) {
          fotosString = producto[field];
          break;
        }
      }

      // Procesar fotos si se encontraron
      if (fotosString) {
        // Intentar diferentes separadores
        let fotosArray = [];
        if (typeof fotosString === 'string') {
          // Separar por coma y espacio, o solo coma, o punto y coma
          fotosArray = fotosString
            .split(/[,;]\s*|,\s*/)
            .map(f => f.trim())
            .filter(f => f && f.length > 0);
        } else if (Array.isArray(fotosString)) {
          fotosArray = fotosString.map(f => String(f).trim()).filter(f => f && f.length > 0);
        }
        
        producto.fotosArray = fotosArray;
      } else {
        producto.fotosArray = [];
      }

      return producto;
    });

    // Filtrar productos vacíos (filas sin datos)
    const productosFiltrados = productos.filter(p => {
      // Considerar un producto válido si tiene al menos modelo o marca
      return p.modelo || p.marca || Object.values(p).some(v => v && v.toString().trim() !== '');
    });

    // Retornar respuesta exitosa
    return res.status(200).json({
      success: true,
      count: productosFiltrados.length,
      productos: productosFiltrados
    });

  } catch (error) {
    console.error('Error al obtener catálogo desde Google Sheets:', error);
    
    // Manejar diferentes tipos de errores
    if (error.message?.includes('ENOTFOUND') || error.message?.includes('getaddrinfo')) {
      return res.status(503).json({
        error: 'Error de conexión',
        message: 'No se pudo conectar con Google Sheets. Verifica tu conexión a internet.'
      });
    }

    if (error.message?.includes('authentication') || error.message?.includes('credentials')) {
      return res.status(401).json({
        error: 'Error de autenticación',
        message: 'Las credenciales de Google Sheets no son válidas. Verifica las variables de entorno.'
      });
    }

    if (error.message?.includes('not found') || error.message?.includes('404')) {
      return res.status(404).json({
        error: 'Hoja no encontrada',
        message: 'No se encontró la hoja de cálculo especificada. Verifica el ID de la hoja.'
      });
    }

    // Error genérico
    return res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message || 'Ocurrió un error al obtener el catálogo',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
