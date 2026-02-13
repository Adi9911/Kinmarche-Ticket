const app = require('./app');
const { initDb } = require('./db');

const PORT = process.env.PORT || 5000;

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║   🎫 Ticketing System Backend         ║
║   ✅ Server running on port ${PORT}      ║
║   📡 Ready for frontend connections    ║
║   🗄️  Database initialized              ║
╚════════════════════════════════════════╝
    `);
  });
}).catch(err => {
  console.error('❌ Failed to init DB:', err);
});
