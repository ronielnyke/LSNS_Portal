const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 8080;
const DIST = path.join(__dirname, 'dist');
const DATA_FILE = path.join(__dirname, 'data.json');

// Shared storage
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({}));
}

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

function getNetworkIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const name in interfaces) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  return ips;
}

function findAvailablePort(startPort, callback) {
  const server = http.createServer();
  server.listen(startPort, '0.0.0.0', () => {
    const port = server.address().port;
    server.close(() => callback(port));
  });
  server.on('error', () => {
    findAvailablePort(startPort + 1, callback);
  });
}

function readData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function writeData(data) {
  const tmp = DATA_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, DATA_FILE);
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Shared Storage API
  if (req.url.startsWith('/api/')) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const key = url.pathname.replace('/api/', '');

    if (req.method === 'GET') {
      const data = readData();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data[key] ?? null));
      return;
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        const data = readData();
        try {
          data[key] = JSON.parse(body);
        } catch {
          data[key] = body;
        }
        writeData(data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      });
      return;
    }

    if (req.method === 'DELETE') {
      const data = readData();
      delete data[key];
      writeData(data);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
      return;
    }
  }

  // Static files (SPA fallback)
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
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content, 'utf-8');
  });
});

async function startTunnel(port) {
  try {
    const localtunnel = require('localtunnel');
    const tunnel = await localtunnel({ port });
    console.log('');
    console.log('==========================================');
    console.log('  INTERNET PUBLIC URL (SHARE THIS)');
    console.log('==========================================');
    console.log('  ' + tunnel.url);
    console.log('==========================================');
    console.log('  Kahit mobile data o ibang WiFi —');
    console.log('  buksan lang ang link na ito.');
    console.log('==========================================');
    return tunnel;
  } catch (ltErr) {
    try {
      const ngrok = require('ngrok');
      const url = await ngrok.connect({ addr: port, authtoken: process.env.NGROK_AUTH_TOKEN });
      console.log('');
      console.log('==========================================');
      console.log('  INTERNET PUBLIC URL (SHARE THIS)');
      console.log('==========================================');
      console.log('  ' + url);
      console.log('==========================================');
      return { url, close: () => ngrok.disconnect() };
    } catch (ngErr) {
      console.log('');
      console.log('==========================================');
      console.log('  LOCAL NETWORK ONLY (SAME WIFI)');
      console.log('==========================================');
      console.log('  Para sa INTERNET/MOBILE DATA access:');
      console.log('  1. Run: npm install localtunnel');
      console.log('  2. Run ulit: node server.js');
      console.log('==========================================');
      return null;
    }
  }
}

findAvailablePort(PORT, (availablePort) => {
  server.listen(availablePort, '0.0.0.0', async () => {
    const ips = getNetworkIPs();
    console.log('');
    console.log('==========================================');
    console.log('  SERVER RUNNING SUCCESSFULLY');
    console.log('==========================================');
    console.log('  Local:   http://localhost:' + availablePort);
    ips.forEach(ip => {
      console.log('  Network: http://' + ip + ':' + availablePort);
    });
    console.log('==========================================');
    console.log('');
    console.log('Admin Login: admin@school.edu / admin123');
    console.log('');

    await startTunnel(availablePort);

    const { exec } = require('child_process');
    const url = 'http://localhost:' + availablePort;
    exec('start "" "' + url + '"', (err) => {
      if (err) console.log('Please open your browser manually:', url);
    });
  });
});