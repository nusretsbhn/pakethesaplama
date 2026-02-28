const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const db = require('./db')

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

const PORT = process.env.PORT || 3001
const isProduction = process.env.NODE_ENV === 'production'

// --- Oteller ---
app.get('/api/oteller', (req, res) => {
  const rows = db.prepare('SELECT * FROM oteller').all()
  res.json(rows.map(r => ({
    id: r.id,
    ad: r.ad,
    il: r.il,
    ilce: r.ilce,
    mahalle: r.mahalle || undefined,
    konaklamaTipleri: JSON.parse(r.konaklamaTipleri),
    odaTipleri: JSON.parse(r.odaTipleri),
  })))
})

app.post('/api/oteller', (req, res) => {
  const id = req.body.id || require('crypto').randomUUID()
  const { ad, il, ilce, mahalle, konaklamaTipleri, odaTipleri } = req.body
  db.prepare(`
    INSERT INTO oteller (id, ad, il, ilce, mahalle, konaklamaTipleri, odaTipleri)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, ad, il, ilce, mahalle || null, JSON.stringify(konaklamaTipleri || []), JSON.stringify(odaTipleri || []))
  const row = db.prepare('SELECT * FROM oteller WHERE id = ?').get(id)
  res.status(201).json({
    id: row.id,
    ad: row.ad,
    il: row.il,
    ilce: row.ilce,
    mahalle: row.mahalle || undefined,
    konaklamaTipleri: JSON.parse(row.konaklamaTipleri),
    odaTipleri: JSON.parse(row.odaTipleri),
  })
})

app.patch('/api/oteller/:id', (req, res) => {
  const { ad, il, ilce, mahalle, konaklamaTipleri, odaTipleri } = req.body
  const id = req.params.id
  const row = db.prepare('SELECT * FROM oteller WHERE id = ?').get(id)
  if (!row) return res.status(404).json({ error: 'Bulunamadı' })
  db.prepare(`
    UPDATE oteller SET ad=?, il=?, ilce=?, mahalle=?, konaklamaTipleri=?, odaTipleri=?
    WHERE id=?
  `).run(
    ad ?? row.ad,
    il ?? row.il,
    ilce ?? row.ilce,
    mahalle !== undefined ? mahalle : row.mahalle,
    konaklamaTipleri !== undefined ? JSON.stringify(konaklamaTipleri) : row.konaklamaTipleri,
    odaTipleri !== undefined ? JSON.stringify(odaTipleri) : row.odaTipleri,
    id
  )
  const r = db.prepare('SELECT * FROM oteller WHERE id = ?').get(id)
  res.json({ id: r.id, ad: r.ad, il: r.il, ilce: r.ilce, mahalle: r.mahalle || undefined, konaklamaTipleri: JSON.parse(r.konaklamaTipleri), odaTipleri: JSON.parse(r.odaTipleri) })
})

app.delete('/api/oteller/:id', (req, res) => {
  db.prepare('DELETE FROM oteller WHERE id = ?').run(req.params.id)
  res.status(204).end()
})

// --- Aktiviteler ---
app.get('/api/aktiviteler', (req, res) => {
  const rows = db.prepare('SELECT * FROM aktiviteler').all()
  res.json(rows.map(r => ({
    id: r.id,
    ad: r.ad,
    konum: r.konum,
    sure: r.sure,
    servisVar: !!r.servisVar,
    ogleYemegiVar: !!r.ogleYemegiVar,
    fotografVar: !!r.fotografVar,
  })))
})

app.post('/api/aktiviteler', (req, res) => {
  const id = req.body.id || require('crypto').randomUUID()
  const { ad, konum, sure, servisVar, ogleYemegiVar, fotografVar } = req.body
  db.prepare(`
    INSERT INTO aktiviteler (id, ad, konum, sure, servisVar, ogleYemegiVar, fotografVar)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, ad, konum, sure ?? 0, servisVar ? 1 : 0, ogleYemegiVar ? 1 : 0, fotografVar ? 1 : 0)
  const row = db.prepare('SELECT * FROM aktiviteler WHERE id = ?').get(id)
  res.status(201).json({ id: row.id, ad: row.ad, konum: row.konum, sure: row.sure, servisVar: !!row.servisVar, ogleYemegiVar: !!row.ogleYemegiVar, fotografVar: !!row.fotografVar })
})

app.patch('/api/aktiviteler/:id', (req, res) => {
  const id = req.params.id
  const row = db.prepare('SELECT * FROM aktiviteler WHERE id = ?').get(id)
  if (!row) return res.status(404).json({ error: 'Bulunamadı' })
  const u = { ...row, ...req.body }
  db.prepare(`
    UPDATE aktiviteler SET ad=?, konum=?, sure=?, servisVar=?, ogleYemegiVar=?, fotografVar=? WHERE id=?
  `).run(u.ad, u.konum, u.sure, u.servisVar ? 1 : 0, u.ogleYemegiVar ? 1 : 0, u.fotografVar ? 1 : 0, id)
  res.json(db.prepare('SELECT * FROM aktiviteler WHERE id = ?').get(id))
})

app.delete('/api/aktiviteler/:id', (req, res) => {
  db.prepare('DELETE FROM aktiviteler WHERE id = ?').run(req.params.id)
  res.status(204).end()
})

// --- Otel Fiyatları ---
app.get('/api/otel-fiyatlari', (req, res) => {
  const rows = db.prepare('SELECT * FROM otel_fiyatlari').all()
  res.json(rows.map(r => ({
    id: r.id,
    otelId: r.otelId,
    konaklamaTipi: r.konaklamaTipi,
    odaTipi: r.odaTipi,
    baslangicTarihi: r.baslangicTarihi,
    bitisTarihi: r.bitisTarihi,
    listeFiyati: r.listeFiyati,
    indirimDilimleri: JSON.parse(r.indirimDilimleri || '[]'),
  })))
})

app.post('/api/otel-fiyatlari', (req, res) => {
  const id = req.body.id || require('crypto').randomUUID()
  const b = req.body
  db.prepare(`
    INSERT INTO otel_fiyatlari (id, otelId, konaklamaTipi, odaTipi, baslangicTarihi, bitisTarihi, listeFiyati, indirimDilimleri)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, b.otelId, b.konaklamaTipi, b.odaTipi, b.baslangicTarihi, b.bitisTarihi, b.listeFiyati, JSON.stringify(b.indirimDilimleri || []))
  const row = db.prepare('SELECT * FROM otel_fiyatlari WHERE id = ?').get(id)
  res.status(201).json({ id: row.id, otelId: row.otelId, konaklamaTipi: row.konaklamaTipi, odaTipi: row.odaTipi, baslangicTarihi: row.baslangicTarihi, bitisTarihi: row.bitisTarihi, listeFiyati: row.listeFiyati, indirimDilimleri: JSON.parse(row.indirimDilimleri) })
})

app.patch('/api/otel-fiyatlari/:id', (req, res) => {
  const id = req.params.id
  const row = db.prepare('SELECT * FROM otel_fiyatlari WHERE id = ?').get(id)
  if (!row) return res.status(404).json({ error: 'Bulunamadı' })
  const u = { ...row, ...req.body, indirimDilimleri: req.body.indirimDilimleri !== undefined ? req.body.indirimDilimleri : JSON.parse(row.indirimDilimleri) }
  db.prepare(`
    UPDATE otel_fiyatlari SET otelId=?, konaklamaTipi=?, odaTipi=?, baslangicTarihi=?, bitisTarihi=?, listeFiyati=?, indirimDilimleri=? WHERE id=?
  `).run(u.otelId, u.konaklamaTipi, u.odaTipi, u.baslangicTarihi, u.bitisTarihi, u.listeFiyati, JSON.stringify(u.indirimDilimleri), id)
  res.json(db.prepare('SELECT * FROM otel_fiyatlari WHERE id = ?').get(id))
})

app.delete('/api/otel-fiyatlari/:id', (req, res) => {
  db.prepare('DELETE FROM otel_fiyatlari WHERE id = ?').run(req.params.id)
  res.status(204).end()
})

// --- Aktivite Fiyatları ---
app.get('/api/aktivite-fiyatlari', (req, res) => {
  const rows = db.prepare('SELECT * FROM aktivite_fiyatlari').all()
  res.json(rows)
})

app.post('/api/aktivite-fiyatlari', (req, res) => {
  const id = req.body.id || require('crypto').randomUUID()
  const b = req.body
  db.prepare(`
    INSERT INTO aktivite_fiyatlari (id, aktiviteId, baslangicTarihi, bitisTarihi, fiyat)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, b.aktiviteId, b.baslangicTarihi, b.bitisTarihi, b.fiyat)
  res.status(201).json(db.prepare('SELECT * FROM aktivite_fiyatlari WHERE id = ?').get(id))
})

app.patch('/api/aktivite-fiyatlari/:id', (req, res) => {
  const id = req.params.id
  const row = db.prepare('SELECT * FROM aktivite_fiyatlari WHERE id = ?').get(id)
  if (!row) return res.status(404).json({ error: 'Bulunamadı' })
  const u = { ...row, ...req.body }
  db.prepare('UPDATE aktivite_fiyatlari SET aktiviteId=?, baslangicTarihi=?, bitisTarihi=?, fiyat=? WHERE id=?').run(u.aktiviteId, u.baslangicTarihi, u.bitisTarihi, u.fiyat, id)
  res.json(db.prepare('SELECT * FROM aktivite_fiyatlari WHERE id = ?').get(id))
})

app.delete('/api/aktivite-fiyatlari/:id', (req, res) => {
  db.prepare('DELETE FROM aktivite_fiyatlari WHERE id = ?').run(req.params.id)
  res.status(204).end()
})

// --- Yan Hizmetler ---
app.get('/api/yan-hizmetler', (req, res) => {
  res.json(db.prepare('SELECT * FROM yan_hizmetler').all())
})

app.post('/api/yan-hizmetler', (req, res) => {
  const id = req.body.id || require('crypto').randomUUID()
  db.prepare('INSERT INTO yan_hizmetler (id, ad, aciklama) VALUES (?, ?, ?)').run(id, req.body.ad, req.body.aciklama || null)
  res.status(201).json(db.prepare('SELECT * FROM yan_hizmetler WHERE id = ?').get(id))
})

app.patch('/api/yan-hizmetler/:id', (req, res) => {
  const id = req.params.id
  const row = db.prepare('SELECT * FROM yan_hizmetler WHERE id = ?').get(id)
  if (!row) return res.status(404).json({ error: 'Bulunamadı' })
  const u = { ...row, ...req.body }
  db.prepare('UPDATE yan_hizmetler SET ad=?, aciklama=? WHERE id=?').run(u.ad, u.aciklama ?? null, id)
  res.json(db.prepare('SELECT * FROM yan_hizmetler WHERE id = ?').get(id))
})

app.delete('/api/yan-hizmetler/:id', (req, res) => {
  db.prepare('DELETE FROM yan_hizmetler WHERE id = ?').run(req.params.id)
  res.status(204).end()
})

// --- Ayarlar ---
app.get('/api/ayarlar', (req, res) => {
  const row = db.prepare('SELECT * FROM ayarlar WHERE id = 1').get()
  res.json({
    firmaLogosu: row?.firmaLogosu || undefined,
    tursabLogosu: row?.tursabLogosu || undefined,
    webAdresi: row?.webAdresi || '',
    telefonNo: row?.telefonNo || '',
  })
})

app.put('/api/ayarlar', (req, res) => {
  const { firmaLogosu, tursabLogosu, webAdresi, telefonNo } = req.body
  db.prepare(`
    INSERT INTO ayarlar (id, firmaLogosu, tursabLogosu, webAdresi, telefonNo) VALUES (1, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET firmaLogosu=excluded.firmaLogosu, tursabLogosu=excluded.tursabLogosu, webAdresi=excluded.webAdresi, telefonNo=excluded.telefonNo
  `).run(firmaLogosu || null, tursabLogosu || null, webAdresi || '', telefonNo || '')
  const r = db.prepare('SELECT * FROM ayarlar WHERE id = 1').get()
  res.json({ firmaLogosu: r.firmaLogosu || undefined, tursabLogosu: r.tursabLogosu || undefined, webAdresi: r.webAdresi || '', telefonNo: r.telefonNo || '' })
})

// Production: frontend (Vite build) aynı sunucudan servis edilir
if (isProduction) {
  const distPath = path.join(__dirname, '..', 'dist')
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath))
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')))
  }
}

app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} | Veritabanı: data/paket.db`)
})
