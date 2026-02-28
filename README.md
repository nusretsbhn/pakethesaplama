# Tur Paket Hazırlama Sistemi

Telefon öncelikli tur paketi hesaplama ve görsel oluşturma uygulaması.

## Çalıştırma

Veriler **SQLite veritabanında** (proje klasöründe `data/paket.db`) saklanır. Önce API sunucusunu, sonra arayüzü başlatın.

**1. Terminal — API sunucusu (veritabanı):**
```bash
npm install
npm run server
```
`http://localhost:3001` adresinde API çalışır; veritabanı `data/paket.db` dosyasında oluşturulur.

**2. İkinci terminal — Arayüz:**
```bash
npm run dev
```

Tarayıcıda çıkan adresi açın (örn. `http://localhost:5173`).

- **Ana sayfa (/):** Fiyat hesaplama ve paket görseli oluşturma (9 adımlı sihirbaz).
- **Admin (/admin):** Otel, aktivite, fiyat, yan hizmet ve ayar yönetimi. Demo giriş: **şifre `admin`**.

## Özellikler

- **Admin:** Otel girişi (konaklama/oda tipleri), aktivite girişi, otel fiyatı (indirim dilimleri), aktivite fiyatı, yan hizmet, ayarlar (logo, web, telefon).
- **Kullanıcı:** Otel → Tarih → Kişi sayısı → Konaklama/Oda → Aktiviteler → Yan hizmetler → Kar marjı → Hesapla.
- **Hesaplama:** Tek kişi çarpanı 1.7, 2+ yetişkin normal; ilk çocuk (0–10) ücretsiz; 2. ve sonraki bebek ücretsiz.
- **Görsel:** Canvas ile paket görseli, İndir ve Paylaş (Web Share API).
- **Veri:** Tarayıcıda `localStorage` (offline çalışır).

## Build

```bash
npm run build
```

Çıktı: `dist/`. Önizleme: `npm run preview`.

## Easypanel / VPS deploy

Canlıya almak için **adım adım rehber:** [EASYPANEL.md](./EASYPANEL.md)

## PWA

`public/manifest.json` ile ana ekrana eklenebilir.
