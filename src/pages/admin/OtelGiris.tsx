import { useState, useEffect } from 'react'
import { store } from '../../store'
import { KONAKLAMA_TIPLERI } from '../../types'
import type { Otel } from '../../types'

export default function OtelGiris() {
  const [list, setList] = useState<Otel[]>([])
  const [ad, setAd] = useState('')
  const [il, setIl] = useState('')
  const [ilce, setIlce] = useState('')
  const [mahalle, setMahalle] = useState('')
  const [konaklamaTipleri, setKonaklamaTipleri] = useState<string[]>(['Oda + Kahvaltı'])
  const [odaTipleri, setOdaTipleri] = useState<string[]>(['Standart Oda'])
  const [editId, setEditId] = useState<string | null>(null)

  useEffect(() => {
    setList(store.oteller.getAll())
  }, [])

  const addKonaklama = () => {
    setKonaklamaTipleri((k) => [...k, KONAKLAMA_TIPLERI[0]])
  }
  const removeKonaklama = (i: number) => {
    setKonaklamaTipleri((k) => k.filter((_, idx) => idx !== i))
  }
  const setKonaklama = (i: number, v: string) => {
    setKonaklamaTipleri((k) => k.map((x, idx) => (idx === i ? v : x)))
  }

  const addOdaTipi = () => {
    setOdaTipleri((o) => [...o, ''])
  }
  const removeOdaTipi = (i: number) => {
    setOdaTipleri((o) => o.filter((_, idx) => idx !== i))
  }
  const setOdaTipi = (i: number, v: string) => {
    setOdaTipleri((o) => o.map((x, idx) => (idx === i ? v : x)))
  }

  const resetForm = () => {
    setAd('')
    setIl('')
    setIlce('')
    setMahalle('')
    setKonaklamaTipleri(['Oda + Kahvaltı'])
    setOdaTipleri(['Standart Oda'])
    setEditId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ad.trim() || !il.trim() || !ilce.trim()) return
    if (konaklamaTipleri.some((k) => !k.trim()) || odaTipleri.some((o) => !o.trim())) return

    try {
      if (editId) {
        await store.oteller.update(editId, {
          ad: ad.trim(),
          il: il.trim(),
          ilce: ilce.trim(),
          mahalle: mahalle.trim() || undefined,
          konaklamaTipleri: konaklamaTipleri.filter(Boolean),
          odaTipleri: odaTipleri.filter(Boolean),
        })
      } else {
        await store.oteller.add({
          ad: ad.trim(),
          il: il.trim(),
          ilce: ilce.trim(),
          mahalle: mahalle.trim() || undefined,
          konaklamaTipleri: konaklamaTipleri.filter(Boolean),
          odaTipleri: odaTipleri.filter(Boolean),
        })
      }
      setList(store.oteller.getAll())
      resetForm()
    } catch (err) {
      alert('Kayıt yapılamadı. Sunucu çalışıyor mu?')
    }
  }

  const handleEdit = (o: Otel) => {
    setAd(o.ad)
    setIl(o.il)
    setIlce(o.ilce)
    setMahalle(o.mahalle ?? '')
    setKonaklamaTipleri(o.konaklamaTipleri.length ? o.konaklamaTipleri : ['Oda + Kahvaltı'])
    setOdaTipleri(o.odaTipleri.length ? o.odaTipleri : ['Standart Oda'])
    setEditId(o.id)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu oteli silmek istediğinize emin misiniz?')) return
    try {
      await store.oteller.delete(id)
      setList(store.oteller.getAll())
      if (editId === id) resetForm()
    } catch {
      alert('Silinemedi. Sunucu çalışıyor mu?')
    }
  }

  return (
    <>
      <h2>Otel Girişi</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Otel Adı *</label>
          <input value={ad} onChange={(e) => setAd(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>İl *</label>
          <input value={il} onChange={(e) => setIl(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>İlçe *</label>
          <input value={ilce} onChange={(e) => setIlce(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Mahalle</label>
          <input value={mahalle} onChange={(e) => setMahalle(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Konaklama Tipleri * (en az 1)</label>
          <div className="dynamic-list">
            {konaklamaTipleri.map((k, i) => (
              <div key={i} className="row">
                <select value={k} onChange={(e) => setKonaklama(i, e.target.value)}>
                  {KONAKLAMA_TIPLERI.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <button type="button" onClick={() => removeKonaklama(i)} disabled={konaklamaTipleri.length <= 1}>×</button>
              </div>
            ))}
            <button type="button" className="add-btn" onClick={addKonaklama}>Konaklama Tipi Ekle</button>
          </div>
        </div>
        <div className="form-group">
          <label>Oda Tipleri * (en az 1)</label>
          <div className="dynamic-list">
            {odaTipleri.map((o, i) => (
              <div key={i} className="row">
                <input
                  value={o}
                  onChange={(e) => setOdaTipi(i, e.target.value)}
                  placeholder="Örn: Standart Oda"
                />
                <button type="button" onClick={() => removeOdaTipi(i)} disabled={odaTipleri.length <= 1}>×</button>
              </div>
            ))}
            <button type="button" className="add-btn" onClick={addOdaTipi}>Oda Tipi Ekle</button>
          </div>
        </div>
        <button type="submit" className="btn-primary">{editId ? 'Güncelle' : 'Ekle'}</button>
        {editId && (
          <button type="button" className="btn-small" onClick={resetForm} style={{ marginLeft: '0.5rem' }}>
            İptal
          </button>
        )}
      </form>

      <h3 style={{ marginTop: '2rem' }}>Kayıtlı Oteller</h3>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Otel</th>
              <th>İl / İlçe</th>
              <th>Konaklama</th>
              <th>Oda Tipleri</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((o) => (
              <tr key={o.id}>
                <td>{o.ad}</td>
                <td>{o.il} / {o.ilce}</td>
                <td>{o.konaklamaTipleri.join(', ')}</td>
                <td>{o.odaTipleri.join(', ')}</td>
                <td>
                  <button type="button" className="btn-small btn-edit" onClick={() => handleEdit(o)}>Düzenle</button>
                  <button type="button" className="btn-small btn-delete" onClick={() => handleDelete(o.id)}>Sil</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
