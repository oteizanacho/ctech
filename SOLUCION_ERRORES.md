# Solución de Errores de Vercel

## Error: "recursive invocation of commands"

Este error ocurre cuando Vercel detecta que el comando de desarrollo está configurado para ejecutar `vercel dev`, creando un bucle infinito.

### Solución 1: Limpiar configuración del proyecto en Vercel

1. Ve a tu proyecto en Vercel: https://vercel.com/oteizanacho-2216s-projects/ctech
2. Ve a **Settings** > **General**
3. Busca la sección **Development Command**
4. Si está configurado, elimínalo o déjalo vacío
5. Guarda los cambios

### Solución 2: Usar comando directo (sin npm run)

En lugar de `npm run dev`, ejecuta directamente:

```bash
vercel dev --listen 3000
```

### Solución 3: Eliminar y recrear el proyecto (si las anteriores no funcionan)

1. Elimina la carpeta `.vercel`:
   ```bash
   rm -rf .vercel
   ```
   O en Windows:
   ```bash
   rmdir /s .vercel
   ```

2. Ejecuta `vercel dev` directamente (sin npm run):
   ```bash
   vercel dev --listen 3000
   ```

## Error: "No Output Directory named 'public' found"

Este error ocurre porque Vercel está buscando una carpeta `public` que no existe.

### Solución: Actualizar vercel.json

El archivo `vercel.json` ya está actualizado con:
- `"outputDirectory": "."` - Los archivos están en la raíz
- `"buildCommand": null` - No hay build necesario

Si el error persiste después de actualizar `vercel.json`:

1. Ve a tu proyecto en Vercel
2. Ve a **Settings** > **General**
3. En **Build & Development Settings**:
   - **Build Command**: Déjalo vacío o pon `echo 'No build'`
   - **Output Directory**: Pon `.` (punto) o déjalo vacío
   - **Install Command**: `npm install`
4. Guarda los cambios

## Comandos para Desarrollo Local

### Opción Recomendada: Usar servidor Node.js simple

```bash
# Instalar dependencias (solo la primera vez)
npm install

# Ejecutar servidor de desarrollo
npm run dev
```

Esto usa un servidor HTTP simple que:
- ✅ No tiene problemas de invocación recursiva
- ✅ Sirve archivos estáticos
- ✅ Ejecuta las funciones serverless localmente
- ✅ Carga variables de entorno desde `.env.local`

### Alternativa: Usar vercel dev directamente

```bash
# Ejecutar servidor de desarrollo con Vercel
npm run dev:vercel
```

O directamente:
```bash
vercel dev --listen 3000
```

### Si prefieres usar npm run dev

Asegúrate de que en Vercel (Settings > General) no haya un "Development Command" configurado.

## Verificar que funciona

1. Ejecuta `vercel dev --listen 3000`
2. Deberías ver:
   ```
   > Ready! Available at http://localhost:3000
   ```
3. Abre http://localhost:3000 en tu navegador
4. Verifica que la API funcione visitando: http://localhost:3000/api/catalogo

## Configurar Variables de Entorno para Desarrollo Local

Crea un archivo `.env.local` en la raíz del proyecto:

```env
GOOGLE_SHEET_ID=tu_sheet_id_aqui
GOOGLE_SERVICE_ACCOUNT_EMAIL=tu-service-account@tu-proyecto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTu_private_key_aqui\n-----END PRIVATE KEY-----\n"
```

**Nota:** El archivo `.env.local` está en `.gitignore` y no se subirá al repositorio.

## Troubleshooting Adicional

### Si vercel dev no encuentra las variables de entorno

1. Asegúrate de que `.env.local` existe en la raíz del proyecto
2. Verifica que las variables estén correctamente formateadas
3. Reinicia `vercel dev` después de crear/modificar `.env.local`

### Si la API no responde

1. Verifica los logs en la terminal donde corre `vercel dev`
2. Busca logs con prefijo `[API]` para ver qué está pasando
3. Verifica que las credenciales de Google Sheets sean correctas

### Si hay errores de CORS

El `vercel.json` ya está configurado con headers CORS. Si persisten los errores:
1. Verifica que estés accediendo desde `http://localhost:3000`
2. Revisa la consola del navegador para ver el error específico
