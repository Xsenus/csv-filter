import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, 'database.db');
const db = new Database(dbPath);

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT,
    invertor INTEGER,
    firm TEXT,
    series TEXT,
    type TEXT,
    power TEXT,
    powerName TEXT,
    powerValue INTEGER,
    powerOut INTEGER,
    model TEXT,
    expenses REAL,
    cost REAL,
    profit REAL,
    status TEXT,
    note TEXT,
    blockPlacement TEXT
  )
`,
).run();

export default db;
