// Dokümandaki veri modeline göre

export const KONAKLAMA_TIPLERI = [
  'Oda + Kahvaltı',
  'Yarım Pansiyon',
  'Her Şey Dahil',
  'Ultra Her Şey Dahil',
] as const
export type KonaklamaTipi = (typeof KONAKLAMA_TIPLERI)[number]

export interface Otel {
  id: string
  ad: string
  il: string
  ilce: string
  mahalle?: string
  konaklamaTipleri: string[]
  odaTipleri: string[]
}

export interface Aktivite {
  id: string
  ad: string
  konum: string
  sure: number // saat
  servisVar: boolean
  ogleYemegiVar: boolean
  fotografVar: boolean
}

export interface IndirimDilimi {
  bitisTarihi: string // YYYY-MM-DD
  indirimOrani: number // 0-100
}

export interface OtelFiyat {
  id: string
  otelId: string
  konaklamaTipi: string
  odaTipi: string
  baslangicTarihi: string
  bitisTarihi: string
  listeFiyati: number // TL kişi/gece
  indirimDilimleri: IndirimDilimi[]
}

export interface AktiviteFiyat {
  id: string
  aktiviteId: string
  baslangicTarihi: string
  bitisTarihi: string
  fiyat: number // TL kişi başı
}

export interface YanHizmet {
  id: string
  ad: string
  aciklama?: string
}

export type UserRole = 'admin' | 'bayi'

export interface User {
  id: string
  username: string
  role: UserRole
}

export type RezervasyonDurum = 'Aktif' | 'Iptal' | 'Tamamlandi'

export interface Rezervasyon {
  id: string
  musteriAdSoyad: string
  telefon: string
  mail: string
  tcKimlikNo: string
  otelId: string
  konaklamaTipi: string
  odaTipi: string
  girisTarihi: string
  cikisTarihi: string
  yetiskin: number
  cocuk: number
  bebek: number
  aktiviteIds: string[]
  toplamPaketTutari: number
  alinanOnOdeme: number
  not?: string
  durum: RezervasyonDurum
  olusturmaTarihi: string
  olusturan: string
}

export interface Ayarlar {
  firmaLogosu?: string // base64 veya url
  tursabLogosu?: string
  webAdresi: string
  telefonNo: string
}

export const DEFAULT_AYARLAR: Ayarlar = {
  webAdresi: '',
  telefonNo: '',
}
