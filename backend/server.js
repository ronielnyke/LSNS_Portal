const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    // Create table if not exists
    db.run(`CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      age INTEGER,
      grade TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating table:', err);
      } else {
        console.log('Students table ready');
      }
    });
  }
});

// GET all students
app.get('/api/students', (req, res) => {
  db.all('SELECT * FROM students ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, data: rows });
  });
});

// GET single student
app.get('/api/students/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM students WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ success: true, data: row });
  });
});

// CREATE student
app.post('/api/students', (req, res) => {
  const { first_name, last_name, email, age, grade } = req.body;
  
  if (!first_name || !last_name || !email) {
    return res.status(400).json({ error: 'First name, last name, and email are required' });
  }

  const sql = `INSERT INTO students (first_name, last_name, email, age, grade) 
               VALUES (?, ?, ?, ?, ?)`;
  
  db.run(sql, [first_name, last_name, email, age || null, grade || null], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ 
      success: true, 
      message: 'Student created successfully',
      data: { id: this.lastID, first_name, last_name, email, age, grade }
    });
  });
});

// UPDATE student
app.put('/api/students/:id', (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, age, grade } = req.body;

  if (!first_name || !last_name || !email) {
    return res.status(400).json({ error: 'First name, last name, and email are required' });
  }

  const sql = `UPDATE students 
               SET first_name = ?, last_name = ?, email = ?, age = ?, grade = ? 
               WHERE id = ?`;
  
  db.run(sql, [first_name, last_name, email, age || null, grade || null, id], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ 
      success: true, 
      message: 'Student updated successfully',
      data: { id: parseInt(id), first_name, last_name, email, age, grade }
    });
  });
});

// DELETE student
app.delete('/api/students/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM students WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ success: true, message: 'Student deleted successfully' });
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API endpoints:`);
  console.log(`  GET    /api/students`);
  console.log(`  GET    /api/students/:id`);
  console.log(`  POST   /api/students`);
  console.log(`  PUT    /api/students/:id`);
  console.log(`  DELETE /api/students/:id`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Database connection closed');
    process.exit(0);
  });
});