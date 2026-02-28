import { useState, useEffect } from 'react'
import { store } from '../../store'
import type { YanHizmet } from '../../types'

export default function YanHizmetGiris() {
  const [list, setList] = useState<YanHizmet[]>([])
  const [ad, setAd] = useState('')
  const [aciklama, setAciklama] = useState('')
  const [editId, setEditId] = useState<string | null>(null)

  useEffect(() => {
    setList(store.yanHizmetler.getAll())
  }, [])

  const resetForm = () => {
    setAd('')
    setAciklama('')
    setEditId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ad.trim()) return

    try {
      if (editId) {
        await store.yanHizmetler.update(editId, { ad: ad.trim(), aciklama: aciklama.trim() || undefined })
      } else {
        await store.yanHizmetler.add({ ad: ad.trim(), aciklama: aciklama.trim() || undefined })
      }
      setList(store.yanHizmetler.getAll())
      resetForm()
    } catch {
      alert('Kayıt yapılamadı. Sunucu çalışıyor mu?')
    }
  }

  const handleEdit = (y: YanHizmet) => {
    setAd(y.ad)
    setAciklama(y.aciklama ?? '')
    setEditId(y.id)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu hizmeti silmek istediğinize emin misiniz?')) return
    try {
      await store.yanHizmetler.delete(id)
      setList(store.yanHizmetler.getAll())
      if (editId === id) resetForm()
    } catch {
      alert('Silinemedi. Sunucu çalışıyor mu?')
    }
  }

  return (
    <>
      <h2>Yan Hizmet Girişi</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Hizmet Adı *</label>
          <input value={ad} onChange={(e) => setAd(e.target.value)} placeholder="Örn: Otogar Transferi" required />
        </div>
        <div className="form-group">
          <label>Açıklama (opsiyonel)</label>
          <textarea value={aciklama} onChange={(e) => setAciklama(e.target.value)} />
        </div>
        <button type="submit" className="btn-primary">{editId ? 'Güncelle' : 'Ekle'}</button>
        {editId && <button type="button" className="btn-small" onClick={resetForm} style={{ marginLeft: '0.5rem' }}>İptal</button>}
      </form>

      <h3 style={{ marginTop: '2rem' }}>Kayıtlı Yan Hizmetler</h3>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Ad</th>
              <th>Açıklama</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((y) => (
              <tr key={y.id}>
                <td>{y.ad}</td>
                <td>{y.aciklama ?? '–'}</td>
                <td>
                  <button type="button" className="btn-small btn-edit" onClick={() => handleEdit(y)}>Düzenle</button>
                  <button type="button" className="btn-small btn-delete" onClick={() => handleDelete(y.id)}>Sil</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
