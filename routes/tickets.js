const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { verifyToken, checkRole } = require('../auth');
const multer = require('multer');
const path = require('path');

const uploadsDir = path.join(__dirname, '..', 'uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_')}`)
});
const upload = multer({ storage });

// Auto-assign logic
const autoAssignEngineer = (location_id, department_id) => {
  return new Promise((resolve, reject) => {
    db.get(`
      SELECT engineer_id FROM engineers 
      WHERE location_id = ? AND department_id = ? AND availability = 1 AND status = 1
      ORDER BY workload ASC LIMIT 1
    `, [location_id, department_id], (err, engineer) => {
      if (err) return reject(err);
      if (engineer) return resolve(engineer.engineer_id);
      
      // Fallback: search by location only
      db.get(`
        SELECT engineer_id FROM engineers 
        WHERE location_id = ? AND availability = 1 AND status = 1
        ORDER BY workload ASC LIMIT 1
      `, [location_id], (err, engineer) => {
        if (err) return reject(err);
        resolve(engineer ? engineer.engineer_id : null);
      });
    });
  });
};

router.post('/tickets', verifyToken, async (req, res) => {
  const { store_id, title, description, priority } = req.body;
  if (!store_id || !title) return res.status(400).json({ message: 'Store ID and title are required' });

  db.get('SELECT * FROM stores WHERE store_id = ?', [store_id], async (err, store) => {
    if (err || !store) return res.status(400).json({ message: 'Invalid Store ID' });

    db.get('SELECT * FROM users WHERE user_id = ?', [req.user.id], async (err, user) => {
      let assignedEngineerId = null;

      if (user && user.preferred_engineer_id) {
        assignedEngineerId = user.preferred_engineer_id;
      } 
      else if (store.engineer_id) {
        assignedEngineerId = store.engineer_id;
      } 
      else {
        try {
          assignedEngineerId = await autoAssignEngineer(store.location_id, store.department_id);
        } catch (e) {
          console.error(e);
        }
      }

      db.run(`
        INSERT INTO tickets (store_id, location_id, department_id, engineer_id, title, description, priority, created_by, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [store_id, store.location_id, store.department_id, assignedEngineerId, title, description, priority || 2, req.user.id, assignedEngineerId ? 1 : 0],
      function(err) {
        if (err) return res.status(500).json({ message: err.message });
        const ticketId = this.lastID;

        // Generate a human-friendly ticket number (YEAR-000001 style)
        const year = new Date().getFullYear();
        const ticketNumber = `${year}-${String(ticketId).padStart(6, '0')}`;

        db.run('UPDATE tickets SET ticket_number = ? WHERE ticket_id = ?', [ticketNumber, ticketId], (uerr) => {
          if (uerr) console.error('Failed to set ticket_number', uerr.message);
        });

        if (assignedEngineerId) {
          db.run('UPDATE engineers SET workload = workload + 1 WHERE engineer_id = ?', [assignedEngineerId]);
        }

        res.status(201).json({ ticket_id: ticketId, ticket_number: ticketNumber, assigned_engineer_id: assignedEngineerId });
      });
    });
  });
});

// Get single ticket with worklogs
router.get('/tickets/:id', verifyToken, (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM tickets WHERE ticket_id = ?', [id], (err, ticket) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    db.all('SELECT * FROM worklogs WHERE ticket_id = ? ORDER BY created_at ASC', [id], (werr, worklogs) => {
      if (werr) return res.status(500).json({ message: werr.message });
      db.all('SELECT * FROM attachments WHERE ticket_id = ?', [id], (aerr, attachments) => {
        if (aerr) return res.status(500).json({ message: aerr.message });
        res.json({ ...ticket, worklogs, attachments });
      });
    });
  });
});

// Add a worklog / resolution comment (engineer)
router.post('/tickets/:id/worklogs', verifyToken, (req, res) => {
  const ticketId = req.params.id;
  const { comment, status, type, attachment_id } = req.body;

  // find engineer if the user is an engineer
  db.get('SELECT engineer_id FROM engineers WHERE user_id = ?', [req.user.id], (err, engineer) => {
    const engineerId = engineer ? engineer.engineer_id : null;
    db.run('INSERT INTO worklogs (ticket_id, engineer_id, comment, type, status, attachment_id, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [ticketId, engineerId, comment, type || 'worklog', status, attachment_id || null, req.user.id], function(werr) {
        if (werr) return res.status(500).json({ message: werr.message });

        // optionally update ticket status/updated_at
        db.run('UPDATE tickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE ticket_id = ?', [status != null ? status : 2, ticketId]);

        res.status(201).json({ worklog_id: this.lastID });
      });
  });
});

// Upload attachment for ticket
router.post('/tickets/:id/attachments', verifyToken, upload.single('file'), (req, res) => {
  const ticketId = req.params.id;
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const filename = req.file.filename;
  const original = req.file.originalname;
  db.run('INSERT INTO attachments (ticket_id, filename, original_name, uploaded_by) VALUES (?, ?, ?, ?)',
    [ticketId, filename, original, req.user.id], function(aerr) {
      if (aerr) return res.status(500).json({ message: aerr.message });
      res.status(201).json({ attachment_id: this.lastID, filename, original_name: original, url: `/uploads/${filename}` });
    });
});

// Close a ticket with closure details
router.put('/tickets/:id/close', verifyToken, (req, res) => {
  const ticketId = req.params.id;
  const { closure_code, closure_comments, requester_acknowledged } = req.body;

  db.run(`UPDATE tickets SET status = 3, closure_code = ?, closure_comments = ?, closed_by = ?, closed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE ticket_id = ?`,
    [closure_code, closure_comments, req.user.id, ticketId], function(err) {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ message: 'Ticket closed' });
    });
});

router.get('/tickets', verifyToken, (req, res) => {
  let query = 'SELECT * FROM tickets';
  let params = [];

  if (req.user.role === 'USER') {
    query += ' WHERE created_by = ?';
    params.push(req.user.id);
    db.all(query, params, (err, rows) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json(rows);
    });
  } else if (req.user.role === 'ENGINEER') {
    db.get('SELECT engineer_id FROM engineers WHERE user_id = ?', [req.user.id], (err, engineer) => {
      if (err || !engineer) return res.json([]);
      db.all('SELECT * FROM tickets WHERE engineer_id = ?', [engineer.engineer_id], (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(rows);
      });
    });
  } else if (req.user.role === 'MANAGER') {
    query += ' WHERE location_id = ?';
    params.push(req.user.location_id);
    db.all(query, params, (err, rows) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json(rows);
    });
  } else {
    // ADMIN sees all
    db.all(query, params, (err, rows) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json(rows);
    });
  }
});

router.put('/tickets/:id', verifyToken, (req, res) => {
  const { status, engineer_id } = req.body;
  // Should add more specific status change logic here (SLA, etc.)
  db.run('UPDATE tickets SET status = ?, engineer_id = ? WHERE ticket_id = ?',
    [status, engineer_id, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ message: 'Ticket updated' });
    }
  );
});

module.exports = router;
