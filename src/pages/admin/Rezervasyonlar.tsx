import { useState, useEffect, useMemo } from 'react'
import { store } from '../../store'
import { useAuth } from '../../context/AuthContext'
import { hesapla } from '../../utils/hesaplama'
import type { Rezervasyon, RezervasyonDurum } from '../../types'
import '../UserFlow.css'
import './Admin.css'

const BAYI_KAR_MARJI = 8000

export default function Rezervasyonlar() {
  const { user } = useAuth()
  const [list, setList] = useState<Rezervasyon[]>([])
  const [filterDurum, setFilterDurum] = useState<string>('')
  const [filterOlusturan, setFilterOlusturan] = useState<string>('')
  const [formVisible, setFormVisible] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  const [musteriAdSoyad, setMusteriAdSoyad] = useState('')
  const [telefon, setTelefon] = useState('')
  const [mail, setMail] = useState('')
  const [tcKimlikNo, setTcKimlikNo] = useState('')
  const [otelId, setOtelId] = useState('')
  const [konaklamaTipi, setKonaklamaTipi] = useState('')
  const [odaTipi, setOdaTipi] = useState('')
  const [girisTarihi, setGirisTarihi] = useState('')
  const [cikisTarihi, setCikisTarihi] = useState('')
  const [yetiskin, setYetiskin] = useState(2)
  const [cocuk, setCocuk] = useState(0)
  const [bebek, setBebek] = useState(0)
  const [aktiviteIds, setAktiviteIds] = useState<string[]>([])
  const [alinanOnOdeme, setAlinanOnOdeme] = useState<number>(0)
  const [not, setNot] = useState('')
  const [durum, setDurum] = useState<RezervasyonDurum>('Aktif')

  const oteller = store.oteller.getAll().filter((o) => store.otelFiyatlari.getByOtelId(o.id).length > 0)
  const otel = oteller.find((o) => o.id === otelId)
  const aktiviteler = store.aktiviteler.getAll()

  const tarihAraligindakiAktiviteler = useMemo(() => {
    if (!girisTarihi) return aktiviteler
    return aktiviteler.filter((a) => {
      const fiyatlar = store.aktiviteFiyatlari.getByAktiviteId(a.id)
      return fiyatlar.some(
        (f) => girisTarihi >= f.baslangicTarihi && girisTarihi <= f.bitisTarihi
      )
    })
  }, [aktiviteler, girisTarihi])

  const toplamPaketTutari = useMemo(() => {
    if (!otelId || !konaklamaTipi || !odaTipi || !girisTarihi || !cikisTarihi) return 0
    try {
      const sonuc = hesapla({
        otelId,
        girisTarihi,
        cikisTarihi,
        yetiskin,
        cocuk,
        bebek,
        konaklamaTipi,
        odaTipi,
        aktiviteIds,
        yanHizmetIds: [],
        karMarji: BAYI_KAR_MARJI,
      })
      return sonuc?.toplamUcret ?? 0
    } catch {
      return 0
    }
  }, [otelId, konaklamaTipi, odaTipi, girisTarihi, cikisTarihi, yetiskin, cocuk, bebek, aktiviteIds])

  const loadList = async () => {
    const params: { durum?: string; olusturan?: string } = {}
    if (filterDurum) params.durum = filterDurum
    if (filterOlusturan) params.olusturan = filterOlusturan
    else if (user?.role === 'bayi' && user?.username) params.olusturan = user.username
    const data = await store.rezervasyonlar.getAll(params)
    setList(data)
  }

  useEffect(() => {
    loadList()
  }, [filterDurum, filterOlusturan, user?.role, user?.username])

  const resetForm = () => {
    setEditId(null)
    setMusteriAdSoyad('')
    setTelefon('')
    setMail('')
    setTcKimlikNo('')
    setOtelId('')
    setKonaklamaTipi('')
    setOdaTipi('')
    setGirisTarihi('')
    setCikisTarihi('')
    setYetiskin(2)
    setCocuk(0)
    setBebek(0)
    setAktiviteIds([])
    setAlinanOnOdeme(0)
    setNot('')
    setDurum('Aktif')
    setFormVisible(false)
  }

  const openNew = () => {
    resetForm()
    setFormVisible(true)
  }

  const openEdit = (r: Rezervasyon) => {
    setEditId(r.id)
    setMusteriAdSoyad(r.musteriAdSoyad)
    setTelefon(r.telefon)
    setMail(r.mail)
    setTcKimlikNo(r.tcKimlikNo)
    setOtelId(r.otelId)
    setKonaklamaTipi(r.konaklamaTipi)
    setOdaTipi(r.odaTipi)
    setGirisTarihi(r.girisTarihi)
    setCikisTarihi(r.cikisTarihi)
    setYetiskin(r.yetiskin)
    setCocuk(r.cocuk)
    setBebek(r.bebek)
    setAktiviteIds(r.aktiviteIds || [])
    setAlinanOnOdeme(r.alinanOnOdeme)
    setNot(r.not || '')
    setDurum(r.durum)
    setFormVisible(true)
  }

  const handleOtelChange = (id: string) => {
    setOtelId(id)
    setKonaklamaTipi('')
    setOdaTipi('')
  }

  const toggleAktivite = (id: string) => {
    setAktiviteIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!musteriAdSoyad.trim() || !telefon.trim() || !mail.trim() || !otelId || !konaklamaTipi || !odaTipi || !girisTarihi || !cikisTarihi) {
      alert('Zorunlu alanları doldurun.')
      return
    }
    if (toplamPaketTutari <= 0) {
      alert('Tarih ve seçimlere göre toplam paket tutarı hesaplanamadı. Kontrol edin.')
      return
    }
    try {
      const payload = {
        musteriAdSoyad: musteriAdSoyad.trim(),
        telefon: telefon.trim(),
        mail: mail.trim(),
        tcKimlikNo: tcKimlikNo.trim(),
        otelId,
        konaklamaTipi,
        odaTipi,
        girisTarihi,
        cikisTarihi,
        yetiskin,
        cocuk,
        bebek,
        aktiviteIds,
        toplamPaketTutari,
        alinanOnOdeme,
        not: not.trim() || undefined,
        durum,
        olusturan: user?.username ?? '',
      }
      if (editId) {
        await store.rezervasyonlar.update(editId, payload)
      } else {
        await store.rezervasyonlar.add(payload)
      }
      await loadList()
      resetForm()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Kayıt yapılamadı'
      alert(msg)
    }
  }

  return (
    <>
      <h2>Rezervasyonlar</h2>

      <div className="form-group" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <label>
          Durum
          <select value={filterDurum} onChange={(e) => setFilterDurum(e.target.value)}>
            <option value="">Tümü</option>
            <option value="Aktif">Aktif</option>
            <option value="Iptal">İptal</option>
            <option value="Tamamlandi">Tamamlandı</option>
          </select>
        </label>
        {user?.role === 'admin' && (
          <label>
            Oluşturan
            <input
              type="text"
              placeholder="Kullanıcı adı"
              value={filterOlusturan}
              onChange={(e) => setFilterOlusturan(e.target.value)}
              style={{ width: '140px' }}
            />
          </label>
        )}
        <button type="button" className="btn-primary" onClick={openNew}>
          Yeni Rezervasyon
        </button>
      </div>

      {formVisible && (
        <div className="step-card" style={{ marginBottom: '1.5rem' }}>
          <h3>{editId ? 'Rezervasyon Düzenle' : 'Yeni Rezervasyon'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Müşteri Adı-Soyadı *</label>
              <input value={musteriAdSoyad} onChange={(e) => setMusteriAdSoyad(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Telefon *</label>
              <input value={telefon} onChange={(e) => setTelefon(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Mail *</label>
              <input type="email" value={mail} onChange={(e) => setMail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>TC Kimlik No</label>
              <input value={tcKimlikNo} onChange={(e) => setTcKimlikNo(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Otel *</label>
              <select value={otelId} onChange={(e) => handleOtelChange(e.target.value)} required>
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
              <label>Giriş Tarihi *</label>
              <input type="date" value={girisTarihi} onChange={(e) => setGirisTarihi(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Çıkış Tarihi *</label>
              <input type="date" value={cikisTarihi} onChange={(e) => setCikisTarihi(e.target.value)} required />
            </div>
            <div className="form-group" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <label>Yetişkin <input type="number" min={0} value={yetiskin} onChange={(e) => setYetiskin(Number(e.target.value))} style={{ width: '60px' }} /></label>
              <label>Çocuk <input type="number" min={0} value={cocuk} onChange={(e) => setCocuk(Number(e.target.value))} style={{ width: '60px' }} /></label>
              <label>Bebek <input type="number" min={0} value={bebek} onChange={(e) => setBebek(Number(e.target.value))} style={{ width: '60px' }} /></label>
            </div>
            <div className="form-group">
              <label>Aktiviteler</label>
              <div className="checkbox-list">
                {tarihAraligindakiAktiviteler.map((a) => (
                  <label key={a.id} className="checkbox-item">
                    <input type="checkbox" checked={aktiviteIds.includes(a.id)} onChange={() => toggleAktivite(a.id)} />
                    <span>{a.ad}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Toplam Paket Tutarı (otomatik)</label>
              <input type="text" readOnly value={toplamPaketTutari > 0 ? `${toplamPaketTutari.toLocaleString('tr-TR')} TL` : '—'} style={{ background: '#f1f5f9', cursor: 'default' }} />
            </div>
            <div className="form-group">
              <label>Alınan Ön Ödeme (TL)</label>
              <input type="number" min={0} step={1} value={alinanOnOdeme || ''} onChange={(e) => setAlinanOnOdeme(Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label>Not</label>
              <textarea value={not} onChange={(e) => setNot(e.target.value)} rows={2} />
            </div>
            <div className="form-group">
              <label>Durum</label>
              <select value={durum} onChange={(e) => setDurum(e.target.value as RezervasyonDurum)}>
                <option value="Aktif">Aktif</option>
                <option value="Iptal">İptal</option>
                <option value="Tamamlandi">Tamamlandı</option>
              </select>
            </div>
            <button type="submit" className="btn-primary">{editId ? 'Güncelle' : 'Kaydet'}</button>
            <button type="button" className="btn-small" onClick={resetForm} style={{ marginLeft: '0.5rem' }}>İptal</button>
          </form>
        </div>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Müşteri</th>
              <th>Telefon</th>
              <th>Otel</th>
              <th>Giriş</th>
              <th>Toplam</th>
              <th>Durum</th>
              <th>Oluşturan</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => {
              const ot = store.oteller.getById(r.otelId)
              return (
                <tr key={r.id}>
                  <td>{r.musteriAdSoyad}</td>
                  <td>{r.telefon}</td>
                  <td>{ot?.ad ?? r.otelId}</td>
                  <td>{r.girisTarihi}</td>
                  <td>{r.toplamPaketTutari.toLocaleString('tr-TR')} TL</td>
                  <td>{r.durum}</td>
                  <td>{r.olusturan}</td>
                  <td>
                    <button type="button" className="btn-small btn-edit" onClick={() => openEdit(r)}>Düzenle</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {list.length === 0 && !formVisible && <p className="muted">Henüz rezervasyon yok.</p>}
    </>
  )
}
