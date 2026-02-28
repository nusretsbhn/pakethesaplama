import { useState, useEffect } from 'react'
import { store } from '../../store'
import type { Aktivite } from '../../types'

export default function AktiviteGiris() {
  const [list, setList] = useState<Aktivite[]>([])
  const [ad, setAd] = useState('')
  const [konum, setKonum] = useState('')
  const [sure, setSure] = useState<number>(4)
  const [servisVar, setServisVar] = useState(false)
  const [ogleYemegiVar, setOgleYemegiVar] = useState(false)
  const [fotografVar, setFotografVar] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  useEffect(() => {
    setList(store.aktiviteler.getAll())
  }, [])

  const resetForm = () => {
    setAd('')
    setKonum('')
    setSure(4)
    setServisVar(false)
    setOgleYemegiVar(false)
    setFotografVar(false)
    setEditId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ad.trim() || !konum.trim()) return

    try {
      if (editId) {
        await store.aktiviteler.update(editId, {
          ad: ad.trim(),
          konum: konum.trim(),
          sure: Number(sure) || 0,
          servisVar,
          ogleYemegiVar,
          fotografVar,
        })
      } else {
        await store.aktiviteler.add({
          ad: ad.trim(),
          konum: konum.trim(),
          sure: Number(sure) || 0,
          servisVar,
          ogleYemegiVar,
          fotografVar,
        })
      }
      setList(store.aktiviteler.getAll())
      resetForm()
    } catch {
      alert('Kayıt yapılamadı. Sunucu çalışıyor mu?')
    }
  }

  const handleEdit = (a: Aktivite) => {
    setAd(a.ad)
    setKonum(a.konum)
    setSure(a.sure)
    setServisVar(a.servisVar)
    setOgleYemegiVar(a.ogleYemegiVar)
    setFotografVar(a.fotografVar)
    setEditId(a.id)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu aktiviteyi silmek istediğinize emin misiniz?')) return
    try {
      await store.aktiviteler.delete(id)
      setList(store.aktiviteler.getAll())
      if (editId === id) resetForm()
    } catch {
      alert('Silinemedi. Sunucu çalışıyor mu?')
    }
  }

  return (
    <>
      <h2>Aktivite Girişi</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Aktivite Adı *</label>
          <input value={ad} onChange={(e) => setAd(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Konumu *</label>
          <input value={konum} onChange={(e) => setKonum(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Süresi (Saat) *</label>
          <input type="number" min={1} value={sure} onChange={(e) => setSure(Number(e.target.value))} required />
        </div>
        <div className="form-group toggle-wrap">
          <input type="checkbox" id="servis" checked={servisVar} onChange={(e) => setServisVar(e.target.checked)} />
          <label htmlFor="servis">Servisi Var mı?</label>
        </div>
        <div className="form-group toggle-wrap">
          <input type="checkbox" id="ogle" checked={ogleYemegiVar} onChange={(e) => setOgleYemegiVar(e.target.checked)} />
          <label htmlFor="ogle">Öğle Yemeği Var mı?</label>
        </div>
        <div className="form-group toggle-wrap">
          <input type="checkbox" id="foto" checked={fotografVar} onChange={(e) => setFotografVar(e.target.checked)} />
          <label htmlFor="foto">Fotoğraf & Video Dahil mi?</label>
        </div>
        <button type="submit" className="btn-primary">{editId ? 'Güncelle' : 'Ekle'}</button>
        {editId && (
          <button type="button" className="btn-small" onClick={resetForm} style={{ marginLeft: '0.5rem' }}>İptal</button>
        )}
      </form>

      <h3 style={{ marginTop: '2rem' }}>Kayıtlı Aktiviteler</h3>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Ad</th>
              <th>Konum</th>
              <th>Süre</th>
              <th>Servis</th>
              <th>Öğle Yem.</th>
              <th>Foto/Video</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((a) => (
              <tr key={a.id}>
                <td>{a.ad}</td>
                <td>{a.konum}</td>
                <td>{a.sure} sa</td>
                <td>{a.servisVar ? 'Evet' : 'Hayır'}</td>
                <td>{a.ogleYemegiVar ? 'Evet' : 'Hayır'}</td>
                <td>{a.fotografVar ? 'Evet' : 'Hayır'}</td>
                <td>
                  <button type="button" className="btn-small btn-edit" onClick={() => handleEdit(a)}>Düzenle</button>
                  <button type="button" className="btn-small btn-delete" onClick={() => handleDelete(a.id)}>Sil</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
