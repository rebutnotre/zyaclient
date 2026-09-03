import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUILD = path.join(__dirname, 'build');
const PORT = 3000;

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js':   'application/javascript; charset=utf-8',
    '.css':  'text/css; charset=utf-8',
    '.json': 'application/json',
    '.ico':  'image/x-icon',
    '.png':  'image/png',
    '.svg':  'image/svg+xml',
    '.woff2':'font/woff2',
};

http.createServer((req, res) => {
    let url = req.url.split('?')[0];
    let filePath = path.join(BUILD, url);

    // Default to index.html for directory or extensionless paths
    if (!path.extname(filePath)) filePath = path.join(filePath, 'index.html');

    fs.readFile(filePath, (err, data) => {
        if (err) {
            // SPA fallback
            fs.readFile(path.join(BUILD, 'index.html'), (_, d) => {
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(d);
            });
            return;
        }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
        res.end(data);
    });
}).listen(PORT, () => {
    console.log(`Local build running at http://localhost:${PORT}`);
});
