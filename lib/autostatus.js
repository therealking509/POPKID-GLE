import fs from 'fs';

const DB_PATH = './lib/autostatus_db.json';

function loadDB() {
  if (!fs.existsSync(DB_PATH)) return { enabled: false, message: '👋🏾 Nice status!' };
  return JSON.parse(fs.readFileSync(DB_PATH));
}

function saveDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export function enableAutoStatus() {
  const db = loadDB();
  db.enabled = true;
  saveDB(db);
  return db;
}

export function disableAutoStatus() {
  const db = loadDB();
  db.enabled = false;
  saveDB(db);
  return db;
}

export function setAutoStatusMessage(msg) {
  const db = loadDB();
  db.message = msg;
  saveDB(db);
  return db;
}

export function getAutoStatusSettings() {
  return loadDB();
}
