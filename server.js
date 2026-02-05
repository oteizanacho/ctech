// Servidor de desarrollo local simple
// Ejecuta: node server.js

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Cargar variables de entorno desde .env.local
require('dotenv').config({ path: '.env.local' });

// Importar la función de la API
const apiHandler = require('./api/catalogo.js');

const PORT = 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;

  // Manejar rutas de API
  if (pathname.startsWith('/api/')) {
    try {
      // Leer el body si existe
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', async () => {
        try {
          // Crear objeto req/res compatible con Vercel
          const vercelReq = {
            method: req.method,
            url: pathname,
            headers: req.headers,
            query: parsedUrl.query,
            body: body ? JSON.parse(body) : {}
          };

          let responseSent = false;
          const vercelRes = {
            statusCode: 200,
            headers: {},
            setHeader: (key, value) => {
              vercelRes.headers[key] = value;
            },
            status: (code) => {
              vercelRes.statusCode = code;
              return vercelRes;
            },
            json: (data) => {
              if (responseSent) return;
              responseSent = true;
              res.writeHead(vercelRes.statusCode, {
                'Content-Type': 'application/json',
                ...vercelRes.headers
              });
              res.end(JSON.stringify(data));
            },
            end: (data) => {
              if (responseSent) return;
              responseSent = true;
              res.writeHead(vercelRes.statusCode, vercelRes.headers);
              res.end(data || '');
            }
          };

          await apiHandler(vercelReq, vercelRes);
          
          // Si no se envió respuesta, enviar una por defecto
          if (!responseSent) {
            res.writeHead(vercelRes.statusCode, vercelRes.headers);
            res.end();
          }
        } catch (error) {
          console.error('❌ [Server] Error en API:', error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Internal Server Error', message: error.message }));
        }
      });
    } catch (error) {
      console.error('❌ [Server] Error procesando request:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal Server Error', message: error.message }));
    }
    return;
  }

  // Servir archivos estáticos
  if (pathname === '/') {
    pathname = '/index.html';
  }

  const filePath = path.join(__dirname, pathname);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - File Not Found</h1>');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  // Servidor iniciado
});
