const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');

const PORT = 8080;
const DIST = path.join(__dirname, 'dist');
const DATA_FILE = path.join(__dirname, 'data.json');

// Init data file
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ students: [], subjects: [] }, null, 2));
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
  testServer.on('error', () => findAvailablePort(startPort + 1, callback));
}

function readData() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch { return { students: [], subjects: [] }; }
}

function writeData(data) {
  try { fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2)); }
  catch (err) { console.error('Write error:', err.message); }
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const host = req.headers.host || 'localhost:8080';
  let pathname = req.url || '/';
  try { pathname = new URL(pathname, `http://${host}`).pathname; } catch {}

  // ===== STUDENTS API =====
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
          const s = JSON.parse(body);
          if (!s.first_name || !s.last_name || !s.email) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'First name, last name, email required' }));
            return;
          }
          const data = readData();
          if (!data.students) data.students = [];
          if (data.students.find(x => x.email === s.email)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Email already exists' }));
            return;
          }
          const newStudent = {
            id: generateId(),
            first_name: s.first_name,
            last_name: s.last_name,
            email: s.email,
            student_code: s.student_code || `STU-${Date.now()}`,
            grade_level: s.grade_level || 'Grade 11',
            password: s.password || '',
            subject_ids: s.subject_ids || [],
            created_at: new Date().toISOString()
          };
          data.students.unshift(newStudent);
          writeData(data);
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, data: newStudent }));
        } catch {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Invalid data' }));
        }
      });
      return;
    }
  }

  if (pathname.startsWith('/api/students/')) {
    const id = pathname.split('/')[3];
    const data = readData();
    if (!data.students) data.students = [];

    if (req.method === 'GET') {
      const student = data.students.find(x => x.id === id);
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
          const idx = data.students.findIndex(x => x.id === id);
          if (idx === -1) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Not found' }));
            return;
          }
          if (updates.email && data.students.find((x, i) => i !== idx && x.email === updates.email)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Email already exists' }));
            return;
          }
          data.students[idx] = { ...data.students[idx], ...updates, updated_at: new Date().toISOString() };
          writeData(data);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, data: data.students[idx] }));
        } catch {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Invalid data' }));
        }
      });
      return;
    }

    if (req.method === 'DELETE') {
      const idx = data.students.findIndex(x => x.id === id);
      if (idx === -1) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Not found' }));
        return;
      }
      data.students.splice(idx, 1);
      writeData(data);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
      return;
    }
  }

  // ===== SUBJECTS API =====
  if (pathname === '/api/subjects') {
    const data = readData();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, data: data.subjects || [] }));
    return;
  }

  // ===== HEALTH =====
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'OK' }));
    return;
  }

  // ===== STATIC FILES =====
  let filePath = path.join(DIST, pathname === '/' ? 'index.html' : pathname);
  if (!filePath.startsWith(DIST)) filePath = path.join(DIST, 'index.html');
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) filePath = path.join(DIST, 'index.html');
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, content) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
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
    console.log('  SERVER RUNNING');
    console.log('========================================');
    console.log('  Local:   http://localhost:' + port);
    ips.forEach(ip => console.log('  Network: http://' + ip + ':' + port));
    console.log('========================================');
    openBrowser('http://localhost:' + port);
  });
});