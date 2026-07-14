const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const { initializeDatabase } = require('./init');

// Load environment config (which can configure DB_PATH)
const dbPath = process.env.DB_PATH || './db/homeland.sqlite';

// Ensure the parent directory for the SQLite file exists
const dbDir = path.dirname(path.resolve(dbPath));
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Open SQLite database connection
const db = new Database(dbPath, { 
  verbose: process.env.NODE_ENV === 'test' ? null : console.log 
});

// Enable SQLite Foreign Key support
db.pragma('foreign_keys = ON');

// Initialize database schema tables
initializeDatabase(db);

module.exports = db;
