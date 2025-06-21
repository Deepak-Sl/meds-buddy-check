import sqlite3 from "sqlite3";


const db = new sqlite3.Database("./medbuddy.db");


db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT
    )
  `);

  // Medications table
  db.run(`
    CREATE TABLE IF NOT EXISTS medications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT,
      dosage TEXT,
      frequency TEXT,
      taken_dates TEXT DEFAULT '[]',
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);
});

export default db;