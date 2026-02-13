const { initDb, db } = require('./db');

initDb().then(() => {
  console.log('Database initialized.');
  db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log('Tables:', rows.map(r => r.name).join(', '));
    process.exit(0);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
