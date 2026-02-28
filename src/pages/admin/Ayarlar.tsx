import { useState, useEffect } from 'react'
import { store } from '../../store'
import type { Ayarlar } from '../../types'

export default function Ayarlar() {
  const [webAdresi, setWebAdresi] = useState('')
  const [telefonNo, setTelefonNo] = useState('')
  const [firmaLogosu, setFirmaLogosu] = useState<string | undefined>()
  const [tursabLogosu, setTursabLogosu] = useState<string | undefined>()

  useEffect(() => {
    const a = store.ayarlar.get()
    setWebAdresi(a.webAdresi ?? '')
    setTelefonNo(a.telefonNo ?? '')
    setFirmaLogosu(a.firmaLogosu)
    setTursabLogosu(a.tursabLogosu)
  }, [])

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setter(String(reader.result))
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await store.ayarlar.set({
        webAdresi: webAdresi.trim(),
        telefonNo: telefonNo.trim(),
        firmaLogosu: firmaLogosu || undefined,
        tursabLogosu: tursabLogosu || undefined,
      })
      alert('Ayarlar kaydedildi.')
    } catch {
      alert('Kaydedilemedi. Sunucu çalışıyor mu?')
    }
  }

  return (
    <>
      <h2>Ayarlar</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Firma Logosu (PNG/JPG)</label>
          <div className="logo-upload">
            <input type="file" accept="image/png,image/jpeg,image/jpg" onChange={(e) => handleFile(e, setFirmaLogosu)} />
            {firmaLogosu && <img src={firmaLogosu} alt="Firma" />}
          </div>
        </div>
        <div className="form-group">
          <label>TURSAB Logosu (PNG/JPG)</label>
          <div className="logo-upload">
            <input type="file" accept="image/png,image/jpeg,image/jpg" onChange={(e) => handleFile(e, setTursabLogosu)} />
            {tursabLogosu && <img src={tursabLogosu} alt="TURSAB" />}
          </div>
        </div>
        <div className="form-group">
          <label>Web Adresi</label>
          <input type="url" value={webAdresi} onChange={(e) => setWebAdresi(e.target.value)} placeholder="https://..." />
        </div>
        <div className="form-group">
          <label>Telefon Numarası</label>
          <input type="tel" value={telefonNo} onChange={(e) => setTelefonNo(e.target.value)} placeholder="+90 ..." />
        </div>
        <button type="submit" className="btn-primary">Kaydet</button>
      </form>
    </>
  )
}
