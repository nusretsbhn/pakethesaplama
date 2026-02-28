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

/** Giriş tarihine göre otel gece fiyatını (indirim dilimi uygulanmış) bulur.
 * "31 Mart'a kadar %20" = giriş 31 Mart ve öncesiyse %20. Doğru dilimi bulmak için
 * dilimler bitiş tarihine göre KÜÇÜKTEN BÜYÜĞE sıralanır; giriş tarihi hangi dilimin
 * bitişine denk geliyorsa (veya ondan önceyse) o dilim uygulanır. */
function otelGecelikFiyat(
  fiyatKaydi: OtelFiyat,
  girisTarihi: string
): number {
  const gir = parseDate(girisTarihi).getTime()
  let oran = 1
  const dilimler = [...(fiyatKaydi.indirimDilimleri ?? [])].sort(
    (a, b) => parseDate(a.bitisTarihi).getTime() - parseDate(b.bitisTarihi).getTime()
  )
  for (const dilim of dilimler) {
    const bit = parseDate(dilim.bitisTarihi).getTime()
    if (gir <= bit) {
      oran = 1 - dilim.indirimOrani / 100
      break
    }
  }
  return fiyatKaydi.listeFiyati * oran
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

  const fiyatlar = store.otelFiyatlari
    .getByOtelId(otelId)
    .filter(
      (f) =>
        f.konaklamaTipi === konaklamaTipi &&
        f.odaTipi === odaTipi &&
        girisTarihi >= f.baslangicTarihi &&
        cikisTarihi <= f.bitisTarihi
    )
  if (fiyatlar.length === 0) return null

  const fiyatKaydi = fiyatlar[0]
  const gecelikFiyat = otelGecelikFiyat(fiyatKaydi, girisTarihi)
  const carpan = odaCarpani(yetiskin)
  const odaSay = odaSayisi(yetiskin, cocuk, bebek)
  const odaFiyatiToplam =
    gecelikFiyat * carpan * geceSayisi * odaSay

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
  }
}
