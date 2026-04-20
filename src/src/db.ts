import Database, { type Database as DatabaseType } from 'better-sqlite3'
import { homedir } from 'node:os'
import { join } from 'node:path'

const DB_PATH = join(homedir(), '.habit-tracker.db')

const db: DatabaseType = new Database(DB_PATH)

// Enable foreign key enforcement (required for ON DELETE CASCADE)
db.pragma('foreign_keys = ON')
db.pragma('journal_mode = WAL')

// Schema initialisation — idempotent, runs on every startup
db.exec(`
  CREATE TABLE IF NOT EXISTS habits (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL UNIQUE,
    created_at TEXT    NOT NULL DEFAULT (date('now'))
  );

  CREATE TABLE IF NOT EXISTS tracking (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    date     TEXT    NOT NULL,
    UNIQUE(habit_id, date)
  );
`)

export default db
