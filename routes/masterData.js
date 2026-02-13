const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { verifyToken, checkRole } = require('../auth');

// Locations
router.get('/locations', verifyToken, (req, res) => {
  db.all('SELECT * FROM locations', (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(rows);
  });
});

router.post('/locations', verifyToken, checkRole(['ADMIN']), (req, res) => {
  const { name, city, state, country, status } = req.body;
  if (!name) return res.status(400).json({ message: 'Name is required' });
  db.run('INSERT INTO locations (name, city, state, country, status) VALUES (?, ?, ?, ?, ?)',
    [name, city, state, country, status === undefined ? 1 : status],
    function(err) {
      if (err) return res.status(500).json({ message: err.message });
      res.status(201).json({ location_id: this.lastID, name, city, state, country, status: status === undefined ? 1 : status });
    }
  );
});

router.put('/locations/:id', verifyToken, checkRole(['ADMIN']), (req, res) => {
  const { name, city, state, country, status } = req.body;
  db.run('UPDATE locations SET name = ?, city = ?, state = ?, country = ?, status = ? WHERE location_id = ?',
    [name, city, state, country, status, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ message: 'Location updated' });
    }
  );
});

router.delete('/locations/:id', verifyToken, checkRole(['ADMIN']), (req, res) => {
  db.run('DELETE FROM locations WHERE location_id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: 'Location deleted' });
  });
});

// Departments
router.get('/departments', verifyToken, (req, res) => {
  const { location_id } = req.query;
  let query = 'SELECT * FROM departments';
  let params = [];
  if (location_id) {
    query += ' WHERE location_id = ?';
    params.push(location_id);
  }
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(rows);
  });
});

router.post('/departments', verifyToken, checkRole(['ADMIN']), (req, res) => {
  const { name, location_id, status } = req.body;
  if (!name || !location_id) return res.status(400).json({ message: 'Name and location_id are required' });
  db.run('INSERT INTO departments (name, location_id, status) VALUES (?, ?, ?)',
    [name, location_id, status === undefined ? 1 : status],
    function(err) {
      if (err) return res.status(500).json({ message: err.message });
      res.status(201).json({ department_id: this.lastID, name, location_id, status: status === undefined ? 1 : status });
    }
  );
});

router.put('/departments/:id', verifyToken, checkRole(['ADMIN']), (req, res) => {
  const { name, location_id, status } = req.body;
  db.run('UPDATE departments SET name = ?, location_id = ?, status = ? WHERE department_id = ?',
    [name, location_id, status, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ message: 'Department updated' });
    }
  );
});

router.delete('/departments/:id', verifyToken, checkRole(['ADMIN']), (req, res) => {
  db.run('DELETE FROM departments WHERE department_id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: 'Department deleted' });
  });
});

module.exports = router;
