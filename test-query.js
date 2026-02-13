const bcrypt = require('bcryptjs');
const { db, initDb } = require('./db');

const test = async () => {
  await initDb();

  // Test 1: Check user with name='admin'
  db.get('SELECT * FROM users WHERE name = ?', ['admin'], async (err, user) => {
    console.log('\n=== Test 1: Query by name ===');
    console.log('Error:', err?.message);
    console.log('User found:', !!user);
    if (user) {
      console.log('User:', {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        password_preview: user.password.substring(0, 30) + '...'
      });

      // Test password
      const isMatch = await bcrypt.compare('Admin@321*#', user.password);
      console.log('Password matches Admin@321*#:', isMatch);
    }

    // Test 2: Query like the login does
    db.get('SELECT * FROM users WHERE email = ? OR name = ?', ['admin', 'admin'], (err2, user2) => {
      console.log('\n=== Test 2: Query with OR (same value twice) ===');
      console.log('Error:', err2?.message);
      console.log('User found:', !!user2);
      if (user2) {
        console.log('User:', {
          user_id: user2.user_id,
          name: user2.name,
          email: user2.email
        });
      }

      process.exit(0);
    });
  });
};

test();
