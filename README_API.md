# Guía de Integración con Google Sheets - API Serverless

Este proyecto utiliza funciones serverless de Vercel para conectar el frontend con Google Sheets como base de datos.

## 📋 Estructura del Proyecto

```
ctech/
├── api/
│   └── catalogo.js          # Endpoint serverless para obtener productos
├── js/
│   ├── apiClient.js         # Cliente para comunicarse con la API
│   ├── products.js          # Lógica de la página de productos
│   ├── index.js             # Lógica de la página principal
│   └── productDetail.js     # Lógica de la página de detalle
├── package.json             # Dependencias del proyecto
├── vercel.json             # Configuración de Vercel
└── ENV_SETUP.md            # Guía de configuración de variables de entorno
```

## 🚀 Configuración Inicial

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno en Vercel

Ve a tu proyecto en Vercel y agrega las siguientes variables de entorno en **Settings > Environment Variables**:

- `GOOGLE_SHEET_ID`: ID de tu hoja de Google Sheets
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`: Email de tu Service Account
- `GOOGLE_PRIVATE_KEY`: Clave privada de tu Service Account

Para más detalles, consulta `ENV_SETUP.md`.

### 3. Estructura de la Hoja de Google Sheets

La primera pestaña de tu hoja debe tener las siguientes columnas (puedes usar los nombres que prefieras, pero estos son los recomendados):

- `Modelo` (o `modelo`)
- `Marca` (o `marca`)
- `Precio` (o `contado_ars`, `contado_usd`)
- `Imagen` (o `fotos`, `fotosArray`)
- `Link_WhatsApp` (opcional)
- `RAM` (o `ram`)
- `Memoria_interna` (o `memoria_interna`)
- `Tamano_pantalla` (o `tamano_pantalla`)
- `Camara_principal` (o `camara_principal`)
- `Bateria_capacidad` (o `bateria_capacidad`)

**Nota:** La API lee automáticamente todas las columnas de la primera fila como headers y las convierte a minúsculas para facilitar el acceso.

## 🔧 Desarrollo Local

Para probar localmente con Vercel:

```bash
npm run dev
```

Esto iniciará un servidor local en `http://localhost:3000` que simula el entorno de Vercel.

## 📡 Endpoint de la API

### GET `/api/catalogo`

Obtiene todos los productos del catálogo desde Google Sheets.

**Respuesta exitosa:**
```json
{
  "success": true,
  "count": 12,
  "productos": [
    {
      "id": 1,
      "modelo": "iPhone 15 Pro",
      "marca": "Apple",
      "contado_ars": 1200000,
      "contado_usd": 999,
      "ram": 8,
      "memoria_interna": 256,
      "fotosArray": ["https://example.com/image1.jpg"]
    }
  ]
}
```

**Errores posibles:**
- `500`: Error de configuración (variables de entorno faltantes)
- `401`: Error de autenticación (credenciales inválidas)
- `404`: Hoja no encontrada
- `503`: Error de conexión

## 🎨 Uso en el Frontend

El frontend usa `apiClient.js` para comunicarse con la API:

```javascript
// Cargar productos
const products = await apiClient.getCatalogo();
```

Los archivos `products.js`, `index.js` y `productDetail.js` ya están actualizados para usar la nueva API.

## 🔒 Seguridad

- Las credenciales de Google se almacenan como variables de entorno en Vercel
- Nunca expongas las credenciales en el código del frontend
- La API maneja CORS automáticamente
- Los errores no exponen información sensible en producción

## 📝 Notas Importantes

1. **Primera fila como headers**: La primera fila de tu hoja debe contener los nombres de las columnas
2. **Fotos**: Si tienes múltiples fotos, sepáralas con `, ` (coma y espacio)
3. **IDs**: Si no tienes una columna `id`, la API generará IDs automáticamente basados en el índice
4. **Tipos de datos**: La API intenta convertir automáticamente valores numéricos cuando es posible

## 🐛 Solución de Problemas

### Error: "Variables de entorno faltantes"
- Verifica que hayas agregado todas las variables en Vercel
- Asegúrate de que estén configuradas para el ambiente correcto (Production/Preview/Development)

### Error: "Error de autenticación"
- Verifica que el email de la Service Account sea correcto
- Asegúrate de que la clave privada incluya los `\n` (saltos de línea)
- Verifica que hayas compartido la hoja con el email de la Service Account

### Error: "Hoja no encontrada"
- Verifica que el `GOOGLE_SHEET_ID` sea correcto
- Asegúrate de que la hoja esté compartida con la Service Account

### Los productos no se muestran
- Abre la consola del navegador para ver errores
- Verifica que la API esté respondiendo correctamente visitando `/api/catalogo` directamente
- Asegúrate de que la estructura de datos de la hoja sea correcta
