const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const DIST = path.join(__dirname, 'dist');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

function findAvailablePort(startPort, callback) {
  const server = http.createServer();
  server.listen(startPort, () => {
    const port = server.address().port;
    server.close(() => callback(port));
  });
  server.on('error', () => {
    findAvailablePort(startPort + 1, callback);
  });
}

const server = http.createServer((req, res) => {
  let filePath = path.join(DIST, req.url === '/' ? 'index.html' : req.url);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST, 'index.html');
  }
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Server Error');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType, 'Access-Control-Allow-Origin': '*' });
    res.end(content, 'utf-8');
  });
});

findAvailablePort(PORT, (availablePort) => {
  server.listen(availablePort, () => {
    console.log('');
    console.log('==========================================');
    console.log('  SERVER RUNNING SUCCESSFULLY');
    console.log('==========================================');
    console.log('  URL: http://localhost:' + availablePort);
    console.log('==========================================');
    console.log('');
    console.log('Admin Login: admin@school.edu / admin123');
    console.log('');
    const { exec } = require('child_process');
    const url = 'http://localhost:' + availablePort;
    exec('start "" "' + url + '"', (err) => {
      if (err) console.log('Please open your browser manually:', url);
    });
  });
});
