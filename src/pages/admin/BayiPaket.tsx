import { useState, useMemo } from 'react'
import { store } from '../../store'
import { hesapla, type HesaplamaGirdisi, type HesaplamaSonucu } from '../../utils/hesaplama'
import '../UserFlow.css'

const BAYI_KAR_MARJI = 8000

export default function BayiPaket() {
  const [step, setStep] = useState(1)
  const [otelId, setOtelId] = useState('')
  const [girisTarihi, setGirisTarihi] = useState('')
  const [cikisTarihi, setCikisTarihi] = useState('')
  const [yetiskin, setYetiskin] = useState(2)
  const [cocuk, setCocuk] = useState(0)
  const [bebek, setBebek] = useState(0)
  const [konaklamaTipi, setKonaklamaTipi] = useState('')
  const [odaTipi, setOdaTipi] = useState('')
  const [aktiviteIds, setAktiviteIds] = useState<string[]>([])
  const [yanHizmetIds, setYanHizmetIds] = useState<string[]>([])
  const [sonuc, setSonuc] = useState<HesaplamaSonucu | null>(null)

  const oteller = store.oteller.getAll()
  const otel = oteller.find((o) => o.id === otelId)
  const aktiviteler = store.aktiviteler.getAll()
  const yanHizmetler = store.yanHizmetler.getAll()

  const tarihAraligindakiAktiviteler = useMemo(() => {
    if (!girisTarihi) return aktiviteler
    return aktiviteler.filter((a) => {
      const fiyatlar = store.aktiviteFiyatlari.getByAktiviteId(a.id)
      return fiyatlar.some(
        (f) => girisTarihi >= f.baslangicTarihi && girisTarihi <= f.bitisTarihi
      )
    })
  }, [aktiviteler, girisTarihi])

  const geceSayisi = useMemo(() => {
    if (!girisTarihi || !cikisTarihi) return 0
    const a = new Date(girisTarihi).getTime()
    const b = new Date(cikisTarihi).getTime()
    return Math.round((b - a) / (24 * 60 * 60 * 1000))
  }, [girisTarihi, cikisTarihi])

  const toggleAktivite = (id: string) => {
    setAktiviteIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }
  const toggleYanHizmet = (id: string) => {
    setYanHizmetIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const handleOtelChange = (id: string) => {
    setOtelId(id)
    setKonaklamaTipi('')
    setOdaTipi('')
  }

  const handleHesapla = () => {
    const girdi: HesaplamaGirdisi = {
      otelId,
      girisTarihi,
      cikisTarihi,
      yetiskin,
      cocuk,
      bebek,
      konaklamaTipi,
      odaTipi,
      aktiviteIds,
      yanHizmetIds,
      karMarji: BAYI_KAR_MARJI,
    }
    try {
      const r = hesapla(girdi)
      if (!r) {
        alert('Hesaplama yapılamadı. Lütfen tarih ve seçimleri kontrol edin.')
        setSonuc(null)
        return
      }
      setSonuc(r)
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.message
          : typeof e === 'string'
          ? e
          : 'Hesaplama sırasında bir hata oluştu.'
      alert(msg)
      setSonuc(null)
    }
  }

  const ileri = () => setStep((s) => Math.min(s + 1, 8))
  const geri = () => setStep((s) => Math.max(s - 1, 1))

  return (
    <div className="user-flow">
      <header className="user-header">
        <h1>Bayi Paket Hesaplama</h1>
      </header>

      <div className="user-steps">
        <div className="step-indicator">Adım {step} / 8</div>

        {step === 1 && (
          <section className="step-card">
            <h2>1. Otel Seçimi</h2>
            <div className="form-group">
              <label>Otel</label>
              <select value={otelId} onChange={(e) => handleOtelChange(e.target.value)} required>
                <option value="">Seçin</option>
                {oteller.map((o) => (
                  <option key={o.id} value={o.id}>{o.ad} — {o.il}</option>
                ))}
              </select>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="step-card">
            <h2>2. Tarih Seçimi</h2>
            <div className="form-group">
              <label>Giriş Tarihi</label>
              <input type="date" value={girisTarihi} onChange={(e) => setGirisTarihi(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Çıkış Tarihi</label>
              <input type="date" value={cikisTarihi} onChange={(e) => setCikisTarihi(e.target.value)} />
            </div>
            {geceSayisi > 0 && <p className="info">{geceSayisi} gece</p>}
          </section>
        )}

        {step === 3 && (
          <section className="step-card">
            <h2>3. Kişi Sayısı</h2>
            <p className="meta">Yetişkin 10+, Çocuk 2–10, Bebek 0–2</p>
            <div className="counter-row">
              <span>Yetişkin</span>
              <div className="counter">
                <button type="button" onClick={() => setYetiskin((n) => Math.max(0, n - 1))}>−</button>
                <span>{yetiskin}</span>
                <button type="button" onClick={() => setYetiskin((n) => n + 1)}>+</button>
              </div>
            </div>
            <div className="counter-row">
              <span>Çocuk</span>
              <div className="counter">
                <button type="button" onClick={() => setCocuk((n) => Math.max(0, n - 1))}>−</button>
                <span>{cocuk}</span>
                <button type="button" onClick={() => setCocuk((n) => n + 1)}>+</button>
              </div>
            </div>
            <div className="counter-row">
              <span>Bebek</span>
              <div className="counter">
                <button type="button" onClick={() => setBebek((n) => Math.max(0, n - 1))}>−</button>
                <span>{bebek}</span>
                <button type="button" onClick={() => setBebek((n) => n + 1)}>+</button>
              </div>
            </div>
          </section>
        )}

        {step === 4 && (
          <section className="step-card">
            <h2>4. Konaklama Tipi</h2>
            {otel ? (
              <div className="form-group">
                <select value={konaklamaTipi} onChange={(e) => setKonaklamaTipi(e.target.value)}>
                  <option value="">Seçin</option>
                  {otel.konaklamaTipleri.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="muted">Önce 1. adımda otel seçin.</p>
            )}
          </section>
        )}

        {step === 5 && (
          <section className="step-card">
            <h2>5. Oda Tipi</h2>
            {otel ? (
              <div className="form-group">
                <select value={odaTipi} onChange={(e) => setOdaTipi(e.target.value)}>
                  <option value="">Seçin</option>
                  {otel.odaTipleri.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="muted">Önce 1. adımda otel seçin.</p>
            )}
          </section>
        )}

        {step === 6 && (
          <section className="step-card">
            <h2>6. Aktivite Seçimi</h2>
            <p className="meta">Giriş tarihine uygun aktiviteler listelenir.</p>
            <div className="checkbox-list">
              {tarihAraligindakiAktiviteler.length === 0 ? (
                <p className="muted">Giriş tarihine uygun aktivite bulunamadı.</p>
              ) : (
                tarihAraligindakiAktiviteler.map((a) => (
                  <label key={a.id} className="checkbox-item">
                    <input type="checkbox" checked={aktiviteIds.includes(a.id)} onChange={() => toggleAktivite(a.id)} />
                    <span>{a.ad}</span>
                  </label>
                ))
              )}
            </div>
          </section>
        )}

        {step === 7 && (
          <section className="step-card">
            <h2>7. Yan Hizmet Seçimi</h2>
            <div className="checkbox-list">
              {yanHizmetler.length === 0 ? (
                <p className="muted">Henüz yan hizmet tanımlanmamış.</p>
              ) : (
                yanHizmetler.map((y) => (
                  <label key={y.id} className="checkbox-item">
                    <input type="checkbox" checked={yanHizmetIds.includes(y.id)} onChange={() => toggleYanHizmet(y.id)} />
                    <span>{y.ad}</span>
                  </label>
                ))
              )}
            </div>
          </section>
        )}

        {step === 8 && (
          <section className="step-card">
            <h2>8. Hesapla</h2>
            <button type="button" className="btn-primary btn-large" onClick={handleHesapla}>
              Hesapla
            </button>
            {sonuc && (
              <div className="sonuc-ozet" style={{ marginTop: '1rem', textAlign: 'left' }}>
                <p><strong>{sonuc.geceSayisi} Gece {sonuc.geceSayisi + 1} Gün Konaklama</strong></p>
                {konaklamaTipi && <p><strong>{konaklamaTipi}</strong></p>}
                <p style={{ marginTop: '0.75rem' }}><strong>AKTİVİTELER</strong></p>
                <p>
                  {aktiviteIds.length === 0
                    ? 'Seçilmedi'
                    : aktiviteIds
                        .map((id) => store.aktiviteler.getById(id)?.ad)
                        .filter(Boolean)
                        .join(' · ')}
                </p>
                <p style={{ marginTop: '0.75rem' }}><strong>YAN HAKLAR</strong></p>
                <p>
                  {yanHizmetIds.length === 0
                    ? 'Seçilmedi'
                    : yanHizmetIds
                        .map((id) => store.yanHizmetler.getAll().find((y) => y.id === id)?.ad)
                        .filter(Boolean)
                        .join(' · ')}
                </p>
                <p style={{ marginTop: '1rem', fontSize: '1.1rem' }}>
                  <strong>Kişi Başı:</strong> {sonuc.kisiBasiUcret.toLocaleString('tr-TR')} TL
                </p>
              </div>
            )}
          </section>
        )}

        <nav className="step-nav">
          <button type="button" onClick={geri} disabled={step <= 1}>Geri</button>
          {step < 8 && (
            <button type="button" onClick={ileri}>İleri</button>
          )}
        </nav>
      </div>
    </div>
  )
}

