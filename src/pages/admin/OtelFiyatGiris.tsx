import { useState, useEffect } from 'react'
import { store } from '../../store'
import type { OtelFiyat, IndirimDilimi } from '../../types'

export default function OtelFiyatGiris() {
  const [list, setList] = useState<OtelFiyat[]>([])
  const [otelId, setOtelId] = useState('')
  const [konaklamaTipi, setKonaklamaTipi] = useState('')
  const [odaTipi, setOdaTipi] = useState('')
  const [baslangicTarihi, setBaslangicTarihi] = useState('')
  const [bitisTarihi, setBitisTarihi] = useState('')
  const [listeFiyati, setListeFiyati] = useState<number>(0)
  const [indirimDilimleri, setIndirimDilimleri] = useState<IndirimDilimi[]>([])
  const [editId, setEditId] = useState<string | null>(null)

  const oteller = store.oteller.getAll()

  useEffect(() => {
    setList(store.otelFiyatlari.getAll())
  }, [])

  const otel = oteller.find((o) => o.id === otelId)

  const addDilim = () => {
    setIndirimDilimleri((d) => [...d, { bitisTarihi: '', indirimOrani: 0 }])
  }
  const removeDilim = (i: number) => {
    setIndirimDilimleri((d) => d.filter((_, idx) => idx !== i))
  }
  const setDilim = (i: number, field: keyof IndirimDilimi, value: string | number) => {
    setIndirimDilimleri((d) =>
      d.map((x, idx) => (idx === i ? { ...x, [field]: value } : x))
    )
  }

  const resetForm = () => {
    setOtelId('')
    setKonaklamaTipi('')
    setOdaTipi('')
    setBaslangicTarihi('')
    setBitisTarihi('')
    setListeFiyati(0)
    setIndirimDilimleri([])
    setEditId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otelId || !konaklamaTipi || !odaTipi || !baslangicTarihi || !bitisTarihi || listeFiyati <= 0) return

    const payload = {
      otelId,
      konaklamaTipi,
      odaTipi,
      baslangicTarihi,
      bitisTarihi,
      listeFiyati,
      indirimDilimleri: indirimDilimleri.filter((d) => d.bitisTarihi && d.indirimOrani >= 0),
    }

    try {
      if (editId) {
        await store.otelFiyatlari.update(editId, payload)
      } else {
        await store.otelFiyatlari.add(payload)
      }
      setList(store.otelFiyatlari.getAll())
      resetForm()
    } catch {
      alert('Kayıt yapılamadı. Sunucu çalışıyor mu?')
    }
  }

  const handleEdit = (f: OtelFiyat) => {
    setOtelId(f.otelId)
    setKonaklamaTipi(f.konaklamaTipi)
    setOdaTipi(f.odaTipi)
    setBaslangicTarihi(f.baslangicTarihi)
    setBitisTarihi(f.bitisTarihi)
    setListeFiyati(f.listeFiyati)
    setIndirimDilimleri(f.indirimDilimleri?.length ? f.indirimDilimleri : [])
    setEditId(f.id)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu fiyat kaydını silmek istediğinize emin misiniz?')) return
    try {
      await store.otelFiyatlari.delete(id)
      setList(store.otelFiyatlari.getAll())
      if (editId === id) resetForm()
    } catch {
      alert('Silinemedi. Sunucu çalışıyor mu?')
    }
  }

  return (
    <>
      <h2>Otel Fiyat Girişi</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Otel *</label>
          <select value={otelId} onChange={(e) => setOtelId(e.target.value)} required>
            <option value="">Seçin</option>
            {oteller.map((o) => (
              <option key={o.id} value={o.id}>{o.ad}</option>
            ))}
          </select>
        </div>
        {otel && (
          <>
            <div className="form-group">
              <label>Konaklama Tipi *</label>
              <select value={konaklamaTipi} onChange={(e) => setKonaklamaTipi(e.target.value)} required>
                <option value="">Seçin</option>
                {otel.konaklamaTipleri.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Oda Tipi *</label>
              <select value={odaTipi} onChange={(e) => setOdaTipi(e.target.value)} required>
                <option value="">Seçin</option>
                {otel.odaTipleri.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          </>
        )}
        <div className="form-group">
          <label>Tarih Aralığı *</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input type="date" value={baslangicTarihi} onChange={(e) => setBaslangicTarihi(e.target.value)} required />
            <span>–</span>
            <input type="date" value={bitisTarihi} onChange={(e) => setBitisTarihi(e.target.value)} required />
          </div>
        </div>
        <div className="form-group">
          <label>Liste Fiyatı (TL, kişi başı/gece) *</label>
          <input type="number" min={0} step={100} value={listeFiyati || ''} onChange={(e) => setListeFiyati(Number(e.target.value))} required />
        </div>
        <div className="form-group">
          <label>İndirim Dilimleri (bitiş tarihi + indirim %)</label>
          <div className="indirim-dilimleri">
            {indirimDilimleri.map((d, i) => (
              <div key={i} className="dilim">
                <input type="date" value={d.bitisTarihi} onChange={(e) => setDilim(i, 'bitisTarihi', e.target.value)} />
                <input type="number" min={0} max={100} placeholder="%" value={d.indirimOrani || ''} onChange={(e) => setDilim(i, 'indirimOrani', Number(e.target.value))} />
                <button type="button" onClick={() => removeDilim(i)}>Sil</button>
              </div>
            ))}
            <button type="button" className="add-btn" onClick={addDilim}>Dilim Ekle</button>
          </div>
        </div>
        <button type="submit" className="btn-primary">{editId ? 'Güncelle' : 'Ekle'}</button>
        {editId && <button type="button" className="btn-small" onClick={resetForm} style={{ marginLeft: '0.5rem' }}>İptal</button>}
      </form>

      <h3 style={{ marginTop: '2rem' }}>Kayıtlı Otel Fiyatları</h3>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Otel</th>
              <th>Konaklama / Oda</th>
              <th>Tarih Aralığı</th>
              <th>Liste Fiyatı</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((f) => {
              const ot = store.oteller.getById(f.otelId)
              return (
                <tr key={f.id}>
                  <td>{ot?.ad ?? f.otelId}</td>
                  <td>{f.konaklamaTipi} / {f.odaTipi}</td>
                  <td>{f.baslangicTarihi} – {f.bitisTarihi}</td>
                  <td>{f.listeFiyati} TL</td>
                  <td>
                    <button type="button" className="btn-small btn-edit" onClick={() => handleEdit(f)}>Düzenle</button>
                    <button type="button" className="btn-small btn-delete" onClick={() => handleDelete(f.id)}>Sil</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
