# Configuración para Desarrollo Local

Esta guía te ayudará a configurar el proyecto para ejecutarlo localmente con `npm run dev`.

## 📋 Prerrequisitos

1. **Node.js** instalado (versión 14 o superior)
2. **Vercel CLI** instalado globalmente
3. **Cuenta de Google Cloud** con Service Account configurada

## 🚀 Pasos para Configurar

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Instalar Vercel CLI (si no lo tienes)

```bash
npm install -g vercel
```

### 3. Configurar Variables de Entorno Local

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
GOOGLE_SHEET_ID=tu_sheet_id_aqui
GOOGLE_SERVICE_ACCOUNT_EMAIL=tu-service-account@tu-proyecto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTu_private_key_aqui\n-----END PRIVATE KEY-----\n"
```

**Nota:** El archivo `.env.local` está en `.gitignore` y no se subirá al repositorio.

### 4. Iniciar el Servidor de Desarrollo

**Opción Recomendada (Servidor Node.js simple):**

```bash
npm run dev
```

Esto iniciará un servidor HTTP simple en `http://localhost:3000` que:
- Sirve los archivos estáticos (HTML, CSS, JS)
- Ejecuta las funciones serverless de la API localmente
- Carga las variables de entorno desde `.env.local`

**Alternativa (Vercel Dev):**

Si prefieres usar Vercel Dev directamente:

```bash
npm run dev:vercel
```

O ejecuta directamente:
```bash
vercel dev --listen 3000
```

**Nota:** Si obtienes el error "recursive invocation" con Vercel Dev, ve a la configuración de tu proyecto en Vercel (Settings > General) y elimina el "Development Command" si está configurado.

### 5. Verificar la Conexión

1. Abre tu navegador en `http://localhost:3000`
2. Abre la consola del navegador (F12)
3. Navega a la página de productos
4. Verifica los logs en:
   - **Consola del navegador**: Verás logs con prefijo `[Frontend]`
   - **Terminal donde corre `npm run dev`**: Verás logs con prefijo `[API]`

## 🔍 Debugging

### Logs en el Frontend

Los logs del frontend aparecen en la consola del navegador con el prefijo `[Frontend]`:

- `🔍 [Frontend]` - Inicio de solicitudes
- `📡 [Frontend]` - Respuestas recibidas
- `✅ [Frontend]` - Operaciones exitosas
- `❌ [Frontend]` - Errores
- `📦 [Frontend]` - Datos de productos

### Logs en el Backend (API)

Los logs del backend aparecen en la terminal donde corre `npm run dev` con el prefijo `[API]`:

- `🔍 [API]` - Inicio de solicitudes
- `🔌 [API]` - Conexiones
- `🔐 [API]` - Autenticación
- `📥 [API]` - Carga de datos
- `✅ [API]` - Operaciones exitosas
- `❌ [API]` - Errores
- `📦 [API]` - Datos procesados

### Verificar Datos de Productos

Cuando cargas la página de productos, verás en la consola del navegador:

1. **Lista completa de productos** con todos sus datos
2. **Cada producto individual** con sus propiedades
3. **Resumen** de la cantidad de productos cargados

## 🐛 Solución de Problemas

### Error: "vercel: command not found"

```bash
npm install -g vercel
```

### Error: "Variables de entorno faltantes"

Asegúrate de que el archivo `.env.local` existe y tiene todas las variables configuradas.

### Error: "Cannot connect to Google Sheets"

1. Verifica que las credenciales sean correctas
2. Asegúrate de que la hoja esté compartida con el email de la Service Account
3. Verifica que la API de Google Sheets esté habilitada en Google Cloud Console

### Los logs no aparecen

- Asegúrate de tener la consola del navegador abierta (F12)
- Verifica que no tengas filtros activos en la consola
- Revisa la terminal donde corre `npm run dev`

## 📝 Notas

- El servidor de desarrollo se recarga automáticamente cuando haces cambios
- Los logs te ayudarán a identificar problemas de conexión o formato de datos
- Si ves errores, revisa primero los logs del backend (terminal) y luego los del frontend (consola del navegador)
