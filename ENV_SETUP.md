# Configuración de Variables de Entorno

Para que la API funcione correctamente, necesitas configurar las siguientes variables de entorno en Vercel:

## Variables Requeridas

1. **GOOGLE_SHEET_ID**: El ID de tu hoja de Google Sheets
   - Puedes encontrarlo en la URL de tu hoja: `https://docs.google.com/spreadsheets/d/[ESTE_ES_EL_ID]/edit`
   - Ejemplo: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

2. **GOOGLE_SERVICE_ACCOUNT_EMAIL**: El email de tu Service Account
   - Obtén esto desde Google Cloud Console > IAM & Admin > Service Accounts
   - Ejemplo: `mi-service-account@mi-proyecto.iam.gserviceaccount.com`

3. **GOOGLE_PRIVATE_KEY**: La clave privada de tu Service Account
   - Obtén esto al crear o descargar la clave JSON de la Service Account
   - IMPORTANTE: Mantén las comillas y los `\n` en el valor
   - Ejemplo: `"-----BEGIN PRIVATE KEY-----\nTu_private_key_aqui\n-----END PRIVATE KEY-----\n"`

## Cómo Configurar en Vercel

1. Ve a tu proyecto en Vercel
2. Navega a Settings > Environment Variables
3. Agrega cada variable con su valor correspondiente
4. Asegúrate de agregarlas para todos los ambientes (Production, Preview, Development)

## Cómo Obtener las Credenciales de Google

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
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
7. Comparte tu hoja de Google Sheets con el email de la Service Account:
   - Abre tu hoja de Google Sheets
   - Clic en "Compartir" (Share)
   - Agrega el email de la Service Account con permisos de "Editor" o "Viewer"
