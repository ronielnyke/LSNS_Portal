const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');

const PORT = 8080;
const DIST = path.join(__dirname, 'dist');
const DATA_FILE = path.join(__dirname, 'data.json');

// Initialize data.json
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ students: [] }, null, 2));
}

const mimeTypes = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
};

function getNetworkIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const name in interfaces) {
    for (const iface of interfaces[name]) {
      if ((iface.family === 'IPv4' || iface.family === 4) && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  return ips;
}

function findAvailablePort(startPort, callback) {
  const testServer = http.createServer();
  testServer.listen(startPort, '0.0.0.0', () => {
    const port = testServer.address().port;
    testServer.close(() => callback(port));
  });
  testServer.on('error', () => {
    findAvailablePort(startPort + 1, callback);
  });
}

function readData() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch { return { students: [] }; }
}

function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Write error:', err.message);
  }
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const host = req.headers.host || 'localhost:8080';
  let pathname = req.url || '/';

  try {
    const parsedUrl = new URL(pathname, `http://${host}`);
    pathname = parsedUrl.pathname;
  } catch {
    // fallback if URL parsing fails
  }

  // ===== API: GET ALL / POST NEW =====
  if (pathname === '/api/students') {
    if (req.method === 'GET') {
      const data = readData();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, data: data.students || [] }));
      return;
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const student = JSON.parse(body);
          if (!student.first_name || !student.last_name || !student.email) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'First name, last name, and email are required' }));
            return;
          }
          const data = readData();
          if (!data.students) data.students = [];
          if (data.students.find(s => s.email === student.email)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Email already exists' }));
            return;
          }
          const newStudent = {
            id: generateId(),
            first_name: student.first_name,
            last_name: student.last_name,
            email: student.email,
            age: student.age || null,
            grade: student.grade || null,
            created_at: new Date().toISOString()
          };
          data.students.unshift(newStudent);
          writeData(data);
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, data: newStudent }));
        } catch {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
        }
      });
      return;
    }
  }

  // ===== API: GET ONE / UPDATE / DELETE =====
  if (pathname.startsWith('/api/students/')) {
    const parts = pathname.split('/').filter(p => p);
    const id = parts[2];

    if (req.method === 'GET') {
      const data = readData();
      const student = (data.students || []).find(s => s.id === id);
      if (!student) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Not found' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, data: student }));
      return;
    }

    if (req.method === 'PUT') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const updates = JSON.parse(body);
          const data = readData();
          if (!data.students) data.students = [];
          const index = data.students.findIndex(s => s.id === id);
          if (index === -1) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Not found' }));
            return;
          }
          if (updates.email && data.students.find((s, i) => i !== index && s.email === updates.email)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Email already exists' }));
            return;
          }
          data.students[index] = {
            ...data.students[index],
            first_name: updates.first_name || data.students[index].first_name,
            last_name: updates.last_name || data.students[index].last_name,
            email: updates.email || data.students[index].email,
            age: updates.age !== undefined ? updates.age : data.students[index].age,
            grade: updates.grade !== undefined ? updates.grade : data.students[index].grade,
            updated_at: new Date().toISOString()
          };
          writeData(data);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, data: data.students[index] }));
        } catch {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
        }
      });
      return;
    }

    if (req.method === 'DELETE') {
      const data = readData();
      if (!data.students) data.students = [];
      const index = data.students.findIndex(s => s.id === id);
      if (index === -1) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Not found' }));
        return;
      }
      data.students.splice(index, 1);
      writeData(data);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Deleted' }));
      return;
    }
  }

  // ===== HEALTH CHECK =====
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'OK', node: process.version }));
    return;
  }

  // ===== STATIC FILES =====
  let filePath = path.join(DIST, pathname === '/' ? 'index.html' : pathname);
  
  if (!filePath.startsWith(DIST)) {
    filePath = path.join(DIST, 'index.html');
  }
  
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 - Not Found</h1><p>Run: npm run build</p>');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content, 'utf-8');
  });
});

function openBrowser(url) {
  const cmd = process.platform === 'win32' ? `start "" "${url}"` : process.platform === 'darwin' ? `open "${url}"` : `xdg-open "${url}"`;
  exec(cmd, () => {});
}

findAvailablePort(PORT, (port) => {
  server.listen(port, '0.0.0.0', () => {
    const ips = getNetworkIPs();
    console.log('\n========================================');
    console.log('  SERVER RUNNING - Node', process.version);
    console.log('========================================');
    console.log('  Local:   http://localhost:' + port);
    ips.forEach(ip => console.log('  Network: http://' + ip + ':' + port));
    console.log('========================================');
    console.log('  API: /api/students');
    console.log('========================================');
    openBrowser('http://localhost:' + port);
  });
});