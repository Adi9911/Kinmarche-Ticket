const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const { db } = require('./db');
const { generateToken, verifyToken, checkRole } = require('./auth');
const masterDataRoutes = require('./routes/masterData');
const usersStoresRoutes = require('./routes/usersStores');
const ticketRoutes = require('./routes/tickets');

const app = express();
app.use(cors());
app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ensure uploads directory exists and serve it
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use('/uploads', express.static(uploadsDir));

// Login endpoint (accepts email or username)
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email/username and password required' });

  db.get('SELECT * FROM users WHERE email = ? OR name = ?', [email, email], async (err, user) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    try {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

      const token = generateToken(user);
      res.json({ token, user: { id: user.user_id, name: user.name, email: user.email, role: user.role } });
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  });
});

// Protected me endpoint
app.get('/api/me', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

app.use('/api', masterDataRoutes);
app.use('/api', usersStoresRoutes);
app.use('/api', ticketRoutes);

module.exports = app;
