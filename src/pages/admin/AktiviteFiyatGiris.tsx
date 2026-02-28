import { useState, useEffect } from 'react'
import { store } from '../../store'
import type { AktiviteFiyat } from '../../types'

export default function AktiviteFiyatGiris() {
  const [list, setList] = useState<AktiviteFiyat[]>([])
  const [aktiviteId, setAktiviteId] = useState('')
  const [baslangicTarihi, setBaslangicTarihi] = useState('')
  const [bitisTarihi, setBitisTarihi] = useState('')
  const [fiyat, setFiyat] = useState<number>(0)
  const [editId, setEditId] = useState<string | null>(null)

  const aktiviteler = store.aktiviteler.getAll()

  useEffect(() => {
    setList(store.aktiviteFiyatlari.getAll())
  }, [])

  const resetForm = () => {
    setAktiviteId('')
    setBaslangicTarihi('')
    setBitisTarihi('')
    setFiyat(0)
    setEditId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!aktiviteId || !baslangicTarihi || !bitisTarihi || fiyat <= 0) return

    try {
      if (editId) {
        await store.aktiviteFiyatlari.update(editId, {
          aktiviteId,
          baslangicTarihi,
          bitisTarihi,
          fiyat,
        })
      } else {
        await store.aktiviteFiyatlari.add({
          aktiviteId,
          baslangicTarihi,
          bitisTarihi,
          fiyat,
        })
      }
      setList(store.aktiviteFiyatlari.getAll())
      resetForm()
    } catch {
      alert('Kayıt yapılamadı. Sunucu çalışıyor mu?')
    }
  }

  const handleEdit = (f: AktiviteFiyat) => {
    setAktiviteId(f.aktiviteId)
    setBaslangicTarihi(f.baslangicTarihi)
    setBitisTarihi(f.bitisTarihi)
    setFiyat(f.fiyat)
    setEditId(f.id)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu fiyat kaydını silmek istediğinize emin misiniz?')) return
    try {
      await store.aktiviteFiyatlari.delete(id)
      setList(store.aktiviteFiyatlari.getAll())
      if (editId === id) resetForm()
    } catch {
      alert('Silinemedi. Sunucu çalışıyor mu?')
    }
  }

  return (
    <>
      <h2>Aktivite Fiyat Girişi</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Aktivite *</label>
          <select value={aktiviteId} onChange={(e) => setAktiviteId(e.target.value)} required>
            <option value="">Seçin</option>
            {aktiviteler.map((a) => (
              <option key={a.id} value={a.id}>{a.ad}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Tarih Aralığı *</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input type="date" value={baslangicTarihi} onChange={(e) => setBaslangicTarihi(e.target.value)} required />
            <span>–</span>
            <input type="date" value={bitisTarihi} onChange={(e) => setBitisTarihi(e.target.value)} required />
          </div>
        </div>
        <div className="form-group">
          <label>Kişi Başı Fiyat (TL) *</label>
          <input type="number" min={0} step={50} value={fiyat || ''} onChange={(e) => setFiyat(Number(e.target.value))} required />
        </div>
        <button type="submit" className="btn-primary">{editId ? 'Güncelle' : 'Ekle'}</button>
        {editId && <button type="button" className="btn-small" onClick={resetForm} style={{ marginLeft: '0.5rem' }}>İptal</button>}
      </form>

      <h3 style={{ marginTop: '2rem' }}>Kayıtlı Aktivite Fiyatları</h3>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Aktivite</th>
              <th>Tarih Aralığı</th>
              <th>Fiyat</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((f) => {
              const ak = store.aktiviteler.getById(f.aktiviteId)
              return (
                <tr key={f.id}>
                  <td>{ak?.ad ?? f.aktiviteId}</td>
                  <td>{f.baslangicTarihi} – {f.bitisTarihi}</td>
                  <td>{f.fiyat} TL</td>
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
