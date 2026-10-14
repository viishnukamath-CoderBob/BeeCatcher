const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function load() {
  ensureDir();
  if (!fs.existsSync(DB_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch {
    return null;
  }
}

function save(data) {
  ensureDir();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

let _db = null;

function getDB() {
  if (!_db) {
    const defaults = require('./defaults');
    const stored = load();
    if (stored) {
      _db = stored;
    } else {
      _db = {
        config: {
          eventName: defaults.eventName,
          tagline: defaults.tagline,
          gameDuration: defaults.gameDuration,
          tiers: defaults.tiers,
          adminPassword: 'ibmadmin2025',
        },
        content: defaults.content,
        players: [],
        sessions: {},
      };
      save(_db);
    }
  }
  return _db;
}

function saveDB() {
  save(getDB());
}

module.exports = { getDB, saveDB };
