const { db, initDb } = require('./db');
const bcrypt = require('bcryptjs');

const debug = async () => {
  await initDb();
  
  // Check if user exists
  db.get(`SELECT user_id, name, email, password, role FROM users WHERE email = ? OR name = ?`, 
    ['admin@example.com', 'admin'], 
    async (err, user) => {
      if (err) {
        console.error('Error:', err.message);
      } else if (!user) {
        console.log('No user found with email admin@example.com or name admin');
      } else {
        console.log('User found:', {
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          role: user.role,
          password_hash: user.password.substring(0, 20) + '...'
        });

        // Test password
        const isMatch = await bcrypt.compare('Admin@321*#', user.password);
        console.log('Password match for Admin@321*#:', isMatch);
      }
      process.exit(0);
    });
};

debug();
