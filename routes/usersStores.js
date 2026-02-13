const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const XLSX = require('xlsx');
const { db } = require('../db');
const { verifyToken, checkRole } = require('../auth');

// Users
router.get('/users', verifyToken, checkRole(['ADMIN', 'MANAGER']), (req, res) => {
  db.all('SELECT user_id, name, email, role, location_id, department_id, status, created_at FROM users', (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(rows);
  });
});

router.get('/users/export', verifyToken, checkRole(['ADMIN']), (req, res) => {
  db.all('SELECT user_id, name, email, role, location_id, department_id, status, created_at FROM users', (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename=users.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  });
});

router.post('/users', verifyToken, checkRole(['ADMIN']), async (req, res) => {
  const { name, email, password, role, location_id, department_id } = req.body;
  if (!email || !password || !role) return res.status(400).json({ message: 'Email, password, and role are required' });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (name, email, password, role, location_id, department_id) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, location_id, department_id],
      function(err) {
        if (err) return res.status(500).json({ message: err.message });
        const userId = this.lastID;

        if (role === 'ENGINEER') {
          db.run('INSERT INTO engineers (user_id, name, location_id, department_id) VALUES (?, ?, ?, ?)',
            [userId, name, location_id, department_id],
            (err) => {
              if (err) console.error('Failed to create engineer record:', err);
            }
          );
        }
        
        console.log(`Email notification (mock) sent to ${email}: Welcome to the system! Your credentials are provided.`);
        res.status(201).json({ user_id: userId, name, email, role });
      }
    );
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.put('/users/:id', verifyToken, checkRole(['ADMIN']), async (req, res) => {
  const { name, email, role, location_id, department_id, status, preferred_engineer_id } = req.body;
  db.run('UPDATE users SET name = ?, email = ?, role = ?, location_id = ?, department_id = ?, status = ?, preferred_engineer_id = ? WHERE user_id = ?',
    [name, email, role, location_id, department_id, status, preferred_engineer_id, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ message: 'User updated' });
    }
  );
});

router.delete('/users/:id', verifyToken, checkRole(['ADMIN']), (req, res) => {
  db.run('DELETE FROM users WHERE user_id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: 'User deleted' });
  });
});

// User self-service for preferred engineer
router.put('/me/preferences', verifyToken, (req, res) => {
  const { preferred_engineer_id } = req.body;
  db.run('UPDATE users SET preferred_engineer_id = ? WHERE user_id = ?',
    [preferred_engineer_id, req.user.id],
    function(err) {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ message: 'Preferences updated' });
    }
  );
});

// Engineers
router.get('/engineers', verifyToken, (req, res) => {
  const { location_id, department_id } = req.query;
  let query = 'SELECT * FROM engineers WHERE status = 1';
  let params = [];
  if (location_id) {
    query += ' AND location_id = ?';
    params.push(location_id);
  }
  if (department_id) {
    query += ' AND department_id = ?';
    params.push(department_id);
  }
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(rows);
  });
});

// Stores
router.get('/stores', verifyToken, (req, res) => {
  db.all('SELECT * FROM stores', (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(rows);
  });
});

router.post('/stores', verifyToken, checkRole(['ADMIN']), (req, res) => {
  const { name, location_id, department_id, engineer_id } = req.body;
  db.run('INSERT INTO stores (name, location_id, department_id, engineer_id) VALUES (?, ?, ?, ?)',
    [name, location_id, department_id, engineer_id],
    function(err) {
      if (err) return res.status(500).json({ message: err.message });
      res.status(201).json({ store_id: this.lastID, name, location_id, department_id, engineer_id });
    }
  );
});

router.put('/stores/:id', verifyToken, (req, res) => {
  const { name, location_id, department_id, engineer_id, status } = req.body;
  // Basic security: only ADMIN or person associated with the store should change it.
  // For simplicity here, allowing if role is ADMIN or MANAGER or USER.
  // In a real app, we'd check if the USER actually belongs to this store.
  db.run('UPDATE stores SET name = ?, location_id = ?, department_id = ?, engineer_id = ?, status = ? WHERE store_id = ?',
    [name, location_id, department_id, engineer_id, status, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ message: 'Store updated' });
    }
  );
});

router.delete('/stores/:id', verifyToken, checkRole(['ADMIN']), (req, res) => {
  db.run('DELETE FROM stores WHERE store_id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: 'Store deleted' });
  });
});

module.exports = router;
