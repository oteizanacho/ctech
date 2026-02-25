# ChingaTech Store - Ecommerce de Celulares

Ecommerce dinámico de celulares conectado a Google Sheets con integración a WhatsApp usando arquitectura serverless (Vercel Functions).

**Versión:** 1.0.0  
**Estado:** ✅ Activo - Listo para producción  
**Deployment:** Vercel (Serverless Functions)

## 📋 Características

- ✅ Conexión con Google Sheets para datos de productos (Serverless API)
- ✅ Arquitectura serverless sin servidor dedicado (Vercel Functions)
- ✅ Vista de catálogo dinámica con filtros por marca
- ✅ Detalle de producto con galería de imágenes
- ✅ Integración con WhatsApp para compras directas
- ✅ Búsqueda y filtros de productos por marca
- ✅ Diseño neobrutalista responsive
- ✅ Tema claro/oscuro con persistencia en localStorage
- ✅ Logs de depuración para verificar datos y conexión
- ✅ Servidor de desarrollo local con Node.js

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
│   └── catalogo.js         # Endpoint serverless para obtener productos desde Google Sheets
├── index.html              # Página principal (landing)
├── products.html           # Catálogo de productos con filtros
├── productDetail.html      # Detalle de producto individual
├── styles.css              # Estilos globales (diseño neobrutalista)
├── server.js               # Servidor de desarrollo local
├── package.json            # Dependencias del proyecto
├── vercel.json             # Configuración de Vercel para deployment
├── js/
│   ├── config.js           # Configuración del proyecto (WhatsApp, etc.)
│   ├── apiClient.js        # Cliente para comunicarse con la API serverless
│   ├── googleSheets.js     # Utilidades para Google Sheets (legacy)
│   ├── productRenderer.js  # Renderizado de productos en cards
│   ├── theme.js            # Gestión de tema claro/oscuro
│   ├── index.js            # Script para index.html
│   ├── products.js         # Script para products.html (filtros y catálogo)
│   └── productDetail.js    # Script para productDetail.html
├── README.md               # Este archivo
├── README_API.md           # Documentación de la API serverless
├── ENV_SETUP.md            # Guía de configuración de variables de entorno
├── SETUP_DEV.md            # Guía de desarrollo local
└── SOLUCION_ERRORES.md     # Solución de problemas comunes
```

## 🎯 Funcionalidades

### Catálogo de Productos
- Vista de productos organizados por marca
- Filtros dinámicos por marca (Apple, Xiaomi, Samsung, Motorola, Sony, Nintendo)
- Carga dinámica desde Google Sheets vía API serverless
- Diseño responsive con cards neobrutalistas

### Detalle de Producto
- Galería de imágenes múltiples
- Especificaciones técnicas completas
- Precios en USD y ARS
- Opciones de pago en cuotas (6 y 12 cuotas)
- Botón directo de compra por WhatsApp

### Integración WhatsApp
- Compra directa desde el detalle del producto
- Mensaje automático pre-formateado con marca y modelo
- Configuración del número en `js/config.js`

### Tema Claro/Oscuro
- Toggle de tema en el header
- Persistencia de preferencia en localStorage
- Transiciones suaves entre temas

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

### El tema no persiste

- Verifica que localStorage esté habilitado en tu navegador
- No uses modo incógnito para desarrollo

## 📝 Notas

- Los datos se cargan cada vez que se visita una página desde la API serverless (`/api/catalogo`)
- El tema (claro/oscuro) se guarda en localStorage del navegador
- Las imágenes deben ser URLs públicas accesibles
- El formato de fotos en Google Sheets: `url1, url2, url3` (separadas por coma y espacio)
- Los logs de depuración te ayudarán a verificar la integridad de los datos y la conexión
- La API procesa automáticamente los datos y convierte valores numéricos cuando es posible
- El proyecto está configurado para deployment en Vercel con funciones serverless

## 🚀 Deployment

El proyecto está configurado para deployment en Vercel:

1. **Conecta tu repositorio de GitHub a Vercel**
2. **Configura las variables de entorno** en Vercel Dashboard:
   - `GOOGLE_SHEET_ID`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
3. **Deploy automático**: Cada push a la rama principal desplegará automáticamente

La función serverless en `api/catalogo.js` se ejecutará automáticamente en Vercel.

## 🎨 Personalización

Puedes personalizar:
- Colores y estilos en `styles.css` (diseño neobrutalista)
- Número de WhatsApp en `js/config.js`
- Formato de precios en `js/productRenderer.js`
- Marcas disponibles en `js/products.js` (array `MARCAS_DISPONIBLES`)

## 🛠️ Stack Tecnológico

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js con Vercel Serverless Functions
- **Base de Datos**: Google Sheets (vía Google Sheets API)
- **Autenticación**: Google Service Account (JWT)
- **Deployment**: Vercel
- **Desarrollo Local**: Node.js HTTP Server

## 📞 Soporte

Si tienes problemas, revisa:
1. La consola del navegador (F12) para errores del frontend
2. Los logs del servidor (terminal) para errores de la API
3. Que la configuración en `js/config.js` sea correcta
4. Que los datos en Google Sheets tengan el formato correcto
5. Los archivos de documentación: `SETUP_DEV.md`, `ENV_SETUP.md`, `SOLUCION_ERRORES.md`

## 📄 Licencia

ISC
