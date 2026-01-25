# ChingaTech Store - Ecommerce de Celulares

Ecommerce dinámico de celulares conectado a Google Sheets con integración a WhatsApp usando arquitectura serverless (Vercel Functions).

## 📋 Características

- ✅ Conexión con Google Sheets para datos de productos (Serverless API)
- ✅ Arquitectura serverless sin servidor dedicado
- ✅ Vista de catálogo dinámica
- ✅ Detalle de producto con galería de imágenes
- ✅ Carrito de compras con localStorage
- ✅ Integración con WhatsApp para compras
- ✅ Búsqueda y filtros de productos
- ✅ Diseño neobrutalista responsive
- ✅ Logs de depuración para verificar datos y conexión

## 🚀 Inicio Rápido

### Desarrollo Local

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Instalar Vercel CLI (si no lo tienes):**
   ```bash
   npm install -g vercel
   ```

3. **Configurar variables de entorno:**
   Crea un archivo `.env.local` en la raíz del proyecto:
   ```env
   GOOGLE_SHEET_ID=tu_sheet_id_aqui
   GOOGLE_SERVICE_ACCOUNT_EMAIL=tu-service-account@tu-proyecto.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTu_private_key_aqui\n-----END PRIVATE KEY-----\n"
   ```

4. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador:**
   Ve a `http://localhost:3000`

Para más detalles, consulta `SETUP_DEV.md` y `ENV_SETUP.md`.

## 🚀 Configuración Completa

### 1. Preparar Google Sheets

Tu Google Sheet debe tener las siguientes columnas (en este orden o con estos nombres):

- `id` - ID único del producto
- `marca` - Marca del celular
- `modelo` - Modelo del celular
- `contado_usd` - Precio en dólares
- `contado_ars` - Precio en pesos argentinos
- `cuotas_6` - Precio en 6 cuotas (ARS)
- `cuotas_12` - Precio en 12 cuotas (ARS)
- `tamano_pantalla` - Tamaño de pantalla en pulgadas
- `resolucion` - Resolución en píxeles
- `ram` - Memoria RAM en GB
- `memoria_interna` - Memoria interna en GB
- `bateria_capacidad` - Capacidad de batería en mAh
- `camara_principal` - Cámara principal en MP
- `camara_secundaria` - Cámara secundaria en MP
- `fotos` - Links a las fotos separados por coma y espacio (ej: "url1, url2, url3")

### 2. Configurar Google Cloud y Service Account

**IMPORTANTE:** Este proyecto usa una arquitectura serverless que requiere autenticación con Service Account.

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto o selecciona uno existente
3. Habilita la API de Google Sheets:
   - Ve a "APIs & Services" > "Library"
   - Busca "Google Sheets API" y habilítala
4. Crea una Service Account:
   - Ve a "IAM & Admin" > "Service Accounts"
   - Clic en "Create Service Account"
   - Completa el formulario y crea la cuenta
5. Genera una clave JSON:
   - En la lista de Service Accounts, haz clic en la que acabas de crear
   - Ve a la pestaña "Keys"
   - Clic en "Add Key" > "Create new key"
   - Selecciona "JSON" y descarga el archivo
6. Extrae las credenciales del JSON:
   - Abre el archivo JSON descargado
   - Copia el valor de `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - Copia el valor de `private_key` → `GOOGLE_PRIVATE_KEY`
7. Obtén el ID de tu Google Sheet:
   - De la URL: `https://docs.google.com/spreadsheets/d/ID_AQUI/edit`
   - Copia el ID → `GOOGLE_SHEET_ID`
8. Comparte tu hoja de Google Sheets:
   - Abre tu hoja de Google Sheets
   - Clic en "Compartir" (Share)
   - Agrega el email de la Service Account con permisos de "Editor" o "Viewer"

Para más detalles, consulta `ENV_SETUP.md`.

### 3. Configurar Variables de Entorno

**Para desarrollo local:**
Crea un archivo `.env.local` en la raíz del proyecto con las variables del paso anterior.

**Para producción (Vercel):**
1. Ve a tu proyecto en Vercel
2. Navega a Settings > Environment Variables
3. Agrega cada variable con su valor correspondiente

### 4. Configurar WhatsApp

En `js/config.js`, actualiza el número de WhatsApp:

```javascript
whatsappNumber: '5491123456789' // Reemplaza con tu número
```

El formato debe ser: código de país + número sin el signo + ni espacios.

Ejemplos:
- Argentina: `5491123456789`
- México: `5215512345678`
- España: `34612345678`

## 📁 Estructura del Proyecto

```
ctech/
├── api/
│   └── catalogo.js         # Endpoint serverless para obtener productos
├── index.html              # Página principal
├── products.html           # Catálogo de productos
├── productDetail.html      # Detalle de producto
├── cart.html               # Carrito de compras
├── styles.css              # Estilos globales
├── package.json            # Dependencias del proyecto
├── vercel.json             # Configuración de Vercel
├── js/
│   ├── config.js           # Configuración del proyecto
│   ├── apiClient.js        # Cliente para comunicarse con la API
│   ├── cart.js             # Gestión del carrito
│   ├── productRenderer.js  # Renderizado de productos
│   ├── index.js            # Script para index.html
│   ├── products.js         # Script para products.html
│   ├── productDetail.js    # Script para productDetail.html
│   └── cartPage.js         # Script para cart.html
├── README.md               # Este archivo
├── README_API.md           # Documentación de la API
├── ENV_SETUP.md            # Guía de configuración de variables
└── SETUP_DEV.md            # Guía de desarrollo local
```

## 🎯 Funcionalidades

### Búsqueda y Filtros
- Búsqueda por marca, modelo o RAM
- Filtros por gama (alta/media)
- Filtro de productos 5G

### Carrito de Compras
- Agregar productos al carrito
- Ver resumen de compra
- Eliminar productos
- Persistencia con localStorage

### Integración WhatsApp
- Al hacer clic en "Comprar por WhatsApp" en el detalle del producto
- Al hacer clic en "Comprar por WhatsApp" en el carrito
- Mensaje automático con marca y modelo del producto

## 🔧 Solución de Problemas

### Los productos no se cargan

1. **Verifica los logs de depuración:**
   - Abre la consola del navegador (F12)
   - Busca logs con prefijo `[Frontend]` para ver qué está pasando
   - Revisa la terminal donde corre `npm run dev` para logs con prefijo `[API]`

2. **Verifica las variables de entorno:**
   - Asegúrate de que `.env.local` existe y tiene todas las variables
   - Verifica que los valores sean correctos (sin espacios extra)

3. **Verifica la conexión con Google Sheets:**
   - Asegúrate de que la hoja esté compartida con el email de la Service Account
   - Verifica que el ID de la hoja sea correcto

4. **Revisa la estructura de datos:**
   - La primera fila debe contener los nombres de las columnas
   - Los logs mostrarán todos los productos cargados en la consola

### Ver Logs de Depuración

El proyecto incluye logs detallados para debugging:

- **Frontend (Consola del navegador):** Verás todos los productos cargados con sus datos completos
- **Backend (Terminal):** Verás el proceso de conexión, autenticación y carga de datos

### Error: "Variables de entorno faltantes"

- Verifica que el archivo `.env.local` existe en la raíz del proyecto
- Asegúrate de que todas las variables estén configuradas
- En producción, verifica que las variables estén en Vercel

### Error: "Error de autenticación"

- Verifica que el email de la Service Account sea correcto
- Asegúrate de que la clave privada incluya los `\n` (saltos de línea)
- Verifica que hayas compartido la hoja con el email de la Service Account

### El carrito no persiste

- Verifica que localStorage esté habilitado en tu navegador
- No uses modo incógnito para desarrollo

## 📝 Notas

- Los datos se cargan cada vez que se visita una página desde la API serverless
- El carrito se guarda en localStorage del navegador
- Las imágenes deben ser URLs públicas accesibles
- El formato de fotos en Google Sheets: `url1, url2, url3` (separadas por coma y espacio)
- Los logs de depuración te ayudarán a verificar la integridad de los datos y la conexión
- La API procesa automáticamente los datos y convierte valores numéricos cuando es posible

## 🎨 Personalización

Puedes personalizar:
- Colores en `styles.css` (variables CSS)
- Mensajes de WhatsApp en `js/cart.js`
- Formato de precios en `js/productRenderer.js`

## 📞 Soporte

Si tienes problemas, revisa:
1. La consola del navegador (F12)
2. Que la configuración en `js/config.js` sea correcta
3. Que los datos en Google Sheets tengan el formato correcto
