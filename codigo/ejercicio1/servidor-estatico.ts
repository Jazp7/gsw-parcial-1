import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = 3001;

const server = http.createServer((req, res) => {
    // Construir la ruta absoluta del archivo index.html
    const filePath = path.join(__dirname, 'public', 'index.html');
    
    // Leer el archivo
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            // Si hay error al leer el archivo, responder con 500
            res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Error interno del servidor: No se pudo leer el archivo');
            console.error('Error al leer archivo:', err);
            return;
        }

        // Si la solicitud es a la raíz o a index.html
        if (req.url === '/' || req.url === '/index.html') {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(data);
        } else {
            // Para cualquier otra ruta, mostrar 404
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end('<h1>404 - Página no encontrada</h1>');
        }
    });
});

server.listen(PORT, () => {
    console.log(`✓ Servidor estático ejecutándose en http://localhost:${PORT}`);
    console.log(`✓ Sirviendo contenido desde: ${path.join(__dirname, 'public')}`);
});
