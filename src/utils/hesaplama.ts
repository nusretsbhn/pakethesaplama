import type { OtelFiyat } from '../types'
import { store } from '../store'

export interface HesaplamaGirdisi {
  otelId: string
  girisTarihi: string // YYYY-MM-DD
  cikisTarihi: string
  yetiskin: number
  cocuk: number // 2-10
  bebek: number // 0-2
  konaklamaTipi: string
  odaTipi: string
  aktiviteIds: string[]
  yanHizmetIds: string[]
  karMarji: number
}

export interface HesaplamaSonucu {
  toplamUcret: number
  kisiBasiUcret: number
  geceSayisi: number
  odaFiyatiToplam: number
  aktiviteToplam: number
  karMarji: number
  /** Geçici debug: Hangi indirim dilimi uygulandı */
  uygulananIndirimDilimi?: { bitisTarihi: string; indirimOrani: number } | null
}

function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function gunFarki(baslangic: string, bitis: string): number {
  const a = parseDate(baslangic).getTime()
  const b = parseDate(bitis).getTime()
  return Math.round((b - a) / (24 * 60 * 60 * 1000))
}

/** Kişi başı fiyatı 500'lük dilime yuvarlar: alt 500'e 150 TL'ye kadar fark varsa aşağı, fazlaysa yukarı.
 * Örn: 8650 → 8500, 8655 → 9000 */
function yuvarla500lu(tutar: number): number {
  const alt500 = Math.floor(tutar / 500) * 500
  const fark = tutar - alt500
  if (fark <= 150) return alt500
  return alt500 + 500
}

/** Hesaplama yapıldığı tarihe (bugün) göre otel gece fiyatını (indirim dilimi uygulanmış) bulur.
 * "31 Mart'a kadar %20" = hesaplama bugün 31 Mart ve öncesiyse %20 indirim.
 * Giriş tarihi değil, hesaplama anındaki tarih (DateTime.Now) baz alınır. */
function otelGecelikFiyat(fiyatKaydi: OtelFiyat): { fiyat: number; uygulananDilim: { bitisTarihi: string; indirimOrani: number } | null } {
  const bugun = new Date()
  const bugunStr = `${bugun.getFullYear()}-${String(bugun.getMonth() + 1).padStart(2, '0')}-${String(bugun.getDate()).padStart(2, '0')}`
  const bugunMs = parseDate(bugunStr).getTime()
  let enIyiOran = 1
  let uygulananDilim: { bitisTarihi: string; indirimOrani: number } | null = null
  for (const dilim of fiyatKaydi.indirimDilimleri ?? []) {
    const bit = parseDate(dilim.bitisTarihi).getTime()
    if (bugunMs <= bit) {
      const oran = 1 - dilim.indirimOrani / 100
      if (oran < enIyiOran) {
        enIyiOran = oran
        uygulananDilim = { bitisTarihi: dilim.bitisTarihi, indirimOrani: dilim.indirimOrani }
      }
    }
  }
  return { fiyat: fiyatKaydi.listeFiyati * enIyiOran, uygulananDilim }
}

/** Tek kişi: 1.7, 2+ yetişkin: 2 (veya oda sayısına göre) */
function odaCarpani(yetiskin: number): number {
  if (yetiskin === 1) return 1.7
  return 2
}

/** Oda sayısı: 2 yetişkin = 1 oda, 3-4 = 2 oda, vb. */
function odaSayisi(yetiskin: number, cocuk: number, bebek: number): number {
  const kisi = yetiskin + cocuk + bebek
  if (kisi <= 2) return 1
  return Math.ceil(kisi / 2)
}

/** Ücretli yetişkin: tüm yetişkinler. Ücretsiz: 1. çocuk (0-10), 2. ve sonraki bebek (0-2). İlk bebek ücretli. */
export function ucretliKisiSayisi(
  yetiskin: number,
  cocuk: number,
  bebek: number
): { ucretliYetiskin: number; ucretliAktivite: number } {
  const ucretliYetiskin = yetiskin
  // Aktivitede: yetişkinler + (ilk bebek sayılır) + 2. çocuk ve sonrası ücretli. 1. çocuk ücretsiz. 2.+ bebek ücretsiz.
  let ucretliAktivite = yetiskin
  if (cocuk >= 1) ucretliAktivite += cocuk - 1 // ilk çocuk ücretsiz
  if (bebek >= 1) ucretliAktivite += 1 // sadece ilk bebek ücretli
  return { ucretliYetiskin, ucretliAktivite }
}

export function hesapla(girdi: HesaplamaGirdisi): HesaplamaSonucu | null {
  const {
    otelId,
    girisTarihi,
    cikisTarihi,
    yetiskin,
    cocuk,
    bebek,
    konaklamaTipi,
    odaTipi,
    aktiviteIds,
    karMarji,
  } = girdi

  const geceSayisi = gunFarki(girisTarihi, cikisTarihi)
  if (geceSayisi <= 0) return null

  // İlgili otel için, konaklama/oda tipine göre TÜM fiyat kayıtlarını al
  const fiyatlar = store.otelFiyatlari
    .getByOtelId(otelId)
    .filter((f) => f.konaklamaTipi === konaklamaTipi && f.odaTipi === odaTipi)
  if (fiyatlar.length === 0) return null

  const carpan = odaCarpani(yetiskin)
  const odaSay = odaSayisi(yetiskin, cocuk, bebek)
  const DAY_MS = 24 * 60 * 60 * 1000

  // Gecelik oda fiyatını, her gece için ayrı ayrı hesapla:
  // Örn: 3 gece, ilk gece alt sezon, sonraki 2 gece üst sezon gibi.
  let odaFiyatiToplam = 0
  let uygulananDilim: { bitisTarihi: string; indirimOrani: number } | null = null

  const girDate = parseDate(girisTarihi)
  for (let i = 0; i < geceSayisi; i++) {
    const geceDate = new Date(girDate.getTime() + i * DAY_MS)
    const y = geceDate.getFullYear()
    const m = String(geceDate.getMonth() + 1).padStart(2, '0')
    const d = String(geceDate.getDate()).padStart(2, '0')
    const geceStr = `${y}-${m}-${d}`

    const fiyatKaydi = fiyatlar.find(
      (f) => geceStr >= f.baslangicTarihi && geceStr <= f.bitisTarihi
    )
    if (!fiyatKaydi) {
      // Bu gece için fiyat tanımı yoksa, hata fırlat (UI'da gösterilecek)
      throw new Error(`Bu tarih için otel fiyat kaydı yok: ${geceStr}`)
    }
    const { fiyat: gecelikFiyat, uygulananDilim: geceDilim } = otelGecelikFiyat(fiyatKaydi)
    if (!uygulananDilim && geceDilim) uygulananDilim = geceDilim

    odaFiyatiToplam += gecelikFiyat * carpan * odaSay
  }

  const { ucretliYetiskin, ucretliAktivite } = ucretliKisiSayisi(
    yetiskin,
    cocuk,
    bebek
  )
  if (ucretliYetiskin === 0) return null

  let aktiviteToplam = 0
  const allAktiviteFiyat = store.aktiviteFiyatlari.getAll()
  for (const aid of aktiviteIds) {
    const af = allAktiviteFiyat.find(
      (f) =>
        f.aktiviteId === aid &&
        girisTarihi >= f.baslangicTarihi &&
        cikisTarihi <= f.bitisTarihi
    )
    if (af) aktiviteToplam += af.fiyat * ucretliAktivite
  }

  const toplamUcret = odaFiyatiToplam + aktiviteToplam + karMarji
  const kisiBasiHam = toplamUcret / ucretliYetiskin
  const kisiBasiUcret = yuvarla500lu(kisiBasiHam)

  return {
    toplamUcret,
    kisiBasiUcret,
    geceSayisi,
    odaFiyatiToplam,
    aktiviteToplam,
    karMarji,
    uygulananIndirimDilimi: uygulananDilim,
  }
}
