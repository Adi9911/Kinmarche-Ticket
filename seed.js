const bcrypt = require('bcryptjs');
const { db, initDb } = require('./db');

const seed = async () => {
  await initDb();
  const newPassword = 'Admin@321*#';
  const password = await bcrypt.hash(newPassword, 10);

  // Upsert admin user (set name to 'admin')
  db.get(`SELECT * FROM users WHERE email = ? OR name = ?`, ['admin@example.com', 'admin'], (err, row) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    if (row) {
      db.run(`UPDATE users SET name = ?, email = ?, password = ?, role = ? WHERE user_id = ?`, ['admin', 'admin@example.com', password, 'ADMIN', row.user_id], (uerr) => {
        if (uerr) console.error(uerr);
        else console.log('Super Admin user updated. Username: admin Password: Admin@321*#');
        process.exit(0);
      });
    } else {
      db.run(`INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`, ['admin', 'admin@example.com', password, 'ADMIN'], (ierr) => {
        if (ierr) console.error(ierr);
        else console.log('Super Admin user created. Username: admin Password: Admin@321*#');
        process.exit(0);
      });
    }
  });
};

seed();
