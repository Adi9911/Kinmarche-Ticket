const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const initDb = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      try {
        // Locations table
        db.run(`CREATE TABLE IF NOT EXISTS locations (
            location_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            city TEXT,
            state TEXT,
            country TEXT,
            status INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // Departments table
        db.run(`CREATE TABLE IF NOT EXISTS departments (
            department_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            location_id INTEGER NOT NULL,
            status INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (location_id) REFERENCES locations(location_id)
        )`);

        // Users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT,
            role TEXT,
            location_id INTEGER,
            department_id INTEGER,
            preferred_engineer_id INTEGER,
            status INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (location_id) REFERENCES locations(location_id),
            FOREIGN KEY (department_id) REFERENCES departments(department_id)
        )`);

        // Engineers table
        db.run(`CREATE TABLE IF NOT EXISTS engineers (
            engineer_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            name TEXT,
            location_id INTEGER NOT NULL,
            department_id INTEGER NOT NULL,
            availability INTEGER DEFAULT 1,
            workload INTEGER DEFAULT 0,
            status INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id),
            FOREIGN KEY (location_id) REFERENCES locations(location_id),
            FOREIGN KEY (department_id) REFERENCES departments(department_id)
        )`);

        // Stores table
        db.run(`CREATE TABLE IF NOT EXISTS stores (
            store_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            location_id INTEGER NOT NULL,
            department_id INTEGER NOT NULL,
            engineer_id INTEGER, 
            status INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (location_id) REFERENCES locations(location_id),
            FOREIGN KEY (department_id) REFERENCES departments(department_id),
            FOREIGN KEY (engineer_id) REFERENCES engineers(engineer_id)
        )`);

        // Tickets table
        // Tickets table (extended with fields for resolution/closure and ticket number)
        db.run(`CREATE TABLE IF NOT EXISTS tickets (
            ticket_id INTEGER PRIMARY KEY AUTOINCREMENT,
            ticket_number TEXT UNIQUE,
            store_id INTEGER NOT NULL,
            location_id INTEGER NOT NULL,
            department_id INTEGER NOT NULL,
            engineer_id INTEGER,
            title TEXT,
            description TEXT,
            priority INTEGER DEFAULT 2,
            status INTEGER DEFAULT 0,
            resolution_comments TEXT,
            closure_code TEXT,
            closure_comments TEXT,
            closed_by INTEGER,
            closed_at TIMESTAMP,
            created_by INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP,
            FOREIGN KEY (store_id) REFERENCES stores(store_id),
            FOREIGN KEY (location_id) REFERENCES locations(location_id),
            FOREIGN KEY (department_id) REFERENCES departments(department_id),
            FOREIGN KEY (engineer_id) REFERENCES engineers(engineer_id),
            FOREIGN KEY (created_by) REFERENCES users(user_id),
            FOREIGN KEY (closed_by) REFERENCES users(user_id)
        )`, (err) => {
          if (err) reject(err);
          else {
            // create worklogs table for engineers' updates
            db.run(`CREATE TABLE IF NOT EXISTS worklogs (
                worklog_id INTEGER PRIMARY KEY AUTOINCREMENT,
                ticket_id INTEGER NOT NULL,
                engineer_id INTEGER,
                comment TEXT,
                type TEXT DEFAULT 'worklog',
                status INTEGER,
                attachment_id INTEGER,
                created_by INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id),
                FOREIGN KEY (engineer_id) REFERENCES engineers(engineer_id),
                FOREIGN KEY (attachment_id) REFERENCES attachments(attachment_id),
                FOREIGN KEY (created_by) REFERENCES users(user_id)
              )` , (we) => {
                if (we) console.error('Failed ensuring worklogs table:', we.message);
                // ensure attachments table exists
                db.run(`CREATE TABLE IF NOT EXISTS attachments (
                  attachment_id INTEGER PRIMARY KEY AUTOINCREMENT,
                  ticket_id INTEGER NOT NULL,
                  filename TEXT,
                  original_name TEXT,
                  uploaded_by INTEGER,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id),
                  FOREIGN KEY (uploaded_by) REFERENCES users(user_id)
                )`, (aerr) => {
                  if (aerr) console.error('Failed ensuring attachments table:', aerr.message);
                  resolve();
                });
              });
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  });
};

module.exports = { db, initDb };
