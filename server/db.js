const Database = require('better-sqlite3')
const path = require('path')
const fs = require('fs')

const dataDir = path.join(__dirname, '..', 'data')
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
const dbPath = path.join(dataDir, 'paket.db')
const db = new Database(dbPath)

db.exec(`
  CREATE TABLE IF NOT EXISTS oteller (
    id TEXT PRIMARY KEY,
    ad TEXT NOT NULL,
    il TEXT NOT NULL,
    ilce TEXT NOT NULL,
    mahalle TEXT,
    konaklamaTipleri TEXT NOT NULL,
    odaTipleri TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS aktiviteler (
    id TEXT PRIMARY KEY,
    ad TEXT NOT NULL,
    konum TEXT NOT NULL,
    sure INTEGER NOT NULL,
    servisVar INTEGER NOT NULL,
    ogleYemegiVar INTEGER NOT NULL,
    fotografVar INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS otel_fiyatlari (
    id TEXT PRIMARY KEY,
    otelId TEXT NOT NULL,
    konaklamaTipi TEXT NOT NULL,
    odaTipi TEXT NOT NULL,
    baslangicTarihi TEXT NOT NULL,
    bitisTarihi TEXT NOT NULL,
    listeFiyati REAL NOT NULL,
    indirimDilimleri TEXT NOT NULL,
    FOREIGN KEY (otelId) REFERENCES oteller(id)
  );

  CREATE TABLE IF NOT EXISTS aktivite_fiyatlari (
    id TEXT PRIMARY KEY,
    aktiviteId TEXT NOT NULL,
    baslangicTarihi TEXT NOT NULL,
    bitisTarihi TEXT NOT NULL,
    fiyat REAL NOT NULL,
    FOREIGN KEY (aktiviteId) REFERENCES aktiviteler(id)
  );

  CREATE TABLE IF NOT EXISTS yan_hizmetler (
    id TEXT PRIMARY KEY,
    ad TEXT NOT NULL,
    aciklama TEXT
  );

  CREATE TABLE IF NOT EXISTS ayarlar (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    firmaLogosu TEXT,
    tursabLogosu TEXT,
    webAdresi TEXT NOT NULL DEFAULT '',
    telefonNo TEXT NOT NULL DEFAULT ''
  );

  INSERT OR IGNORE INTO ayarlar (id, webAdresi, telefonNo) VALUES (1, '', '');
`)

module.exports = db
