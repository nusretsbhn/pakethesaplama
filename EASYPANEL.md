# Easypanel’de Tur Paket Hesaplama Çalıştırma

Bu rehber projeyi Easypanel üzerinde VPS’te nasıl canlıya alacağınızı adım adım anlatır.

---

## 1. Easypanel’e giriş

- VPS’te Easypanel kurulu olmalı.
- Tarayıcıda `https://sunucu-ip:3000` veya kendi domain’inizle panele girin.
- Gerekirse hesap oluşturup giriş yapın.

---

## 2. Yeni uygulama ekleme

1. **Apps** (veya **Applications**) sayfasına gidin.
2. **Create** / **New App** / **Add Application** benzeri butona tıklayın.
3. **GitHub** (veya **Git**) ile deploy seçeneğini seçin.

---

## 3. GitHub repo bağlama

1. **Connect to GitHub** (veya **Authorize**) ile GitHub hesabınızı bağlayın (henüz bağlamadıysanız).
2. **Repository** alanından `nusretsbhn/pakethesaplama` reposunu seçin.
3. **Branch:** `main` (varsayılan) kalsın.
4. **Build Type** veya **Deploy method** kısmında **Dockerfile** varsa onu seçin (projede `Dockerfile` var).

---

## 4. Build ayarları (Dockerfile kullanıyorsanız)

- **Dockerfile path:** `Dockerfile` (proje kökünde, varsayılan böyle).
- **Build context:** `.` (kök) kalsın.

Easypanel “Dockerfile detected” diyorsa ekstra build komutu yazmanız gerekmez; **Deploy** / **Build** ile image oluşturulur.

---

## 5. Port ve ortam değişkeni

1. **Port:** Container içinde uygulama **3001** portunda çalışıyor. Easypanel’de:
   - **Container port** / **Internal port:** `3001`
   - **Publish** / **Expose** port’u açık olsun (genelde otomatik 80/443 veya belirlediğiniz port).
2. **Environment variables** bölümüne gerekirse ekleyin:
   - `NODE_ENV` = `production` (Dockerfile’da zaten var; panelde de set edebilirsiniz).

---

## 6. Veritabanını kalıcı yapma (Volume)

SQLite dosyası `data/paket.db` içinde. Container silinince silinmesin diye volume bağlayın:

1. Uygulama ayarlarında **Volumes** / **Storage** / **Mounts** kısmını açın.
2. **Add volume** (veya benzeri) deyin.
3. **Container path:** `/app/data`
4. **Volume name:** Örn. `pakethesaplama-data` (Easypanel bazen otomatik isim verir).
5. Kaydedin.

Böylece her deploy’da veritabanı korunur.

---

## 7. Domain (isteğe bağlı)

- **Domains** / **Custom domain** bölümüne girip örn. `paket.siteniz.com` ekleyin.
- SSL için **HTTPS** / **Let’s Encrypt** açıksa genelde otomatik sertifika alınır.

---

## 8. Deploy etme

1. Tüm ayarları kaydedin.
2. **Deploy** / **Build and deploy** / **Redeploy** butonuna basın.
3. İlk seferde image build birkaç dakika sürebilir.
4. Log’larda “Sunucu http://localhost:3001” benzeri satırı görünce uygulama ayağa kalkmış demektir.

---

## 9. Kontrol

- Tarayıcıda verdiğiniz domain’e veya `https://sunucu-ip:yayınlanan-port` adresine gidin.
- Ana sayfada hesaplama formu, **Admin** linkine tıklayınca giriş sayfası (şifre: `admin`) gelmeli.
- Admin’den bir otel ekleyip ana sayfada listeleyebiliyorsanız hem API hem frontend çalışıyordur.

---

## Özet checklist

| Adım | Ne yaptınız? |
|------|------------------|
| 1 | Easypanel’e girdiniz |
| 2 | Yeni app oluşturdunuz, GitHub’ı seçtiniz |
| 3 | Repo: `nusretsbhn/pakethesaplama`, branch: `main` |
| 4 | Build: Dockerfile ile (veya panelin önerdiği şekilde) |
| 5 | Port: 3001 (container) |
| 6 | Volume: `/app/data` → kalıcı volume |
| 7 | (İsteğe bağlı) Domain + SSL |
| 8 | Deploy ettiniz |
| 9 | Siteyi ve Admin’i test ettiniz |

---

## Sorun giderme

- **Beyaz sayfa / 502:** Container log’larına bakın; `node server/index.js` çalışıyor mu, port 3001 dinleniyor mu?
- **API hatası / “Veritabanı bağlantısı yok”:** Aynı domain’den açıyorsanız `/api` aynı sunucuya gider; farklı domain/port kullanıyorsanız frontend’e `VITE_API_URL` ile API adresini build sırasında vermeniz gerekir (Easypanel’de tek serviste aynı domain kullanıyorsanız gerek yok).
- **Veriler siliniyor:** Volume’u `data` için eklediğinizden ve path’in `/app/data` olduğundan emin olun.
