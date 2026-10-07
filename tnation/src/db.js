'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const config = require('./config');
const seed = require('./seed');

const STATUSES = ['new', 'in_review', 'signed', 'declined'];
const STATUS_LABELS = { new: 'New', in_review: 'In review', signed: 'Signed', declined: 'Declined' };

const SCHEMA = `
CREATE TABLE IF NOT EXISTS talent (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('artist','athlete','creator')),
  city TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT '',
  languages TEXT NOT NULL DEFAULT '',
  genre TEXT NOT NULL DEFAULT '',
  headline TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  achievements TEXT NOT NULL DEFAULT '',
  media TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  featured INTEGER NOT NULL DEFAULT 0,
  is_placeholder INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS shows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  talent_id INTEGER REFERENCES talent(id) ON DELETE SET NULL,
  starts_on TEXT NOT NULL,
  venue TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT 'India',
  region TEXT NOT NULL DEFAULT 'india' CHECK (region IN ('india','overseas')),
  status TEXT NOT NULL DEFAULT 'announced',
  ticket_url TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  is_placeholder INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS enquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  organisation TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  talent_id INTEGER REFERENCES talent(id) ON DELETE SET NULL,
  event_date TEXT NOT NULL DEFAULT '',
  budget TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  details TEXT NOT NULL DEFAULT '{}',
  source_page TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  languages TEXT NOT NULL DEFAULT '',
  genre TEXT NOT NULL DEFAULT '',
  links TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  file_path TEXT NOT NULL DEFAULT '',
  file_name TEXT NOT NULL DEFAULT '',
  file_type TEXT NOT NULL DEFAULT '',
  consent INTEGER NOT NULL DEFAULT 0,
  consent_at TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS calculator_leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL CHECK (kind IN ('calculator','plan')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  organisation TEXT NOT NULL DEFAULT '',
  destination TEXT NOT NULL DEFAULT '',
  first_show_on TEXT NOT NULL DEFAULT '',
  last_show_on TEXT NOT NULL DEFAULT '',
  shows INTEGER,
  fee_per_show REAL,
  currency TEXT NOT NULL DEFAULT '',
  inputs TEXT NOT NULL DEFAULT '{}',
  result TEXT NOT NULL DEFAULT '{}',
  message TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS shows_starts_on ON shows (starts_on);
CREATE INDEX IF NOT EXISTS enquiries_status ON enquiries (status, created_at);
CREATE INDEX IF NOT EXISTS applications_status ON applications (status, created_at);
CREATE INDEX IF NOT EXISTS leads_status ON calculator_leads (status, created_at);
`;

function open(file = config.dbFile) {
  if (file !== ':memory:') fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  db.exec(SCHEMA);
  const { n } = db.prepare('SELECT COUNT(*) AS n FROM talent').get();
  if (n === 0 && process.env.SEED !== 'false') seed.run(db);
  return db;
}

// Insert a row from a plain object, using only the listed columns.
function insert(db, table, row) {
  const cols = Object.keys(row);
  const sql = `INSERT INTO ${table} (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`;
  return Number(db.prepare(sql).run(...cols.map((c) => row[c])).lastInsertRowid);
}

function update(db, table, id, row) {
  const cols = Object.keys(row);
  const sql = `UPDATE ${table} SET ${cols.map((c) => `${c} = ?`).join(', ')}, updated_at = datetime('now') WHERE id = ?`;
  return db.prepare(sql).run(...cols.map((c) => row[c]), id).changes;
}

module.exports = { open, insert, update, STATUSES, STATUS_LABELS };
