import { useRef, useEffect, useState } from 'react'
import type { Ayarlar } from '../types'
import './PaketGorsel.css'

interface Props {
  geceSayisi: number
  konaklamaTipi: string
  aktiviteAdlari: string[]
  yanHizmetAdlari: string[]
  kisiBasiFiyat: number
  ayarlar: Ayarlar
}

/** Görselde otel ismi asla yazılmaz — müşteriye verilmez. */
export default function PaketGorsel({
  geceSayisi,
  konaklamaTipi,
  aktiviteAdlari,
  yanHizmetAdlari,
  kisiBasiFiyat,
  ayarlar,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dataUrl, setDataUrl] = useState<string>('')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const context: CanvasRenderingContext2D = ctx
    const canvasEl: HTMLCanvasElement = canvas

    const templateImg = new Image()
    templateImg.crossOrigin = 'anonymous'

    const loadImage = (src: string): Promise<HTMLImageElement> =>
      new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = src
      })

    let cancelled = false

    templateImg.onload = () => {
      if (cancelled) return
      const W = templateImg.naturalWidth
      const H = templateImg.naturalHeight
      canvas.width = W
      canvas.height = H

      // 1) Şablonu (paket.jpg) tam arka plan olarak çiz
      context.drawImage(templateImg, 0, 0, W, H)

      // 2) Firma logosu (varsa) — sol üst
      const drawLogos = (firmaImg: HTMLImageElement | null, tursabImg: HTMLImageElement | null) => {
        const logoY = H * 0.028
        const logoH = H * 0.055
        if (firmaImg) {
          const scale = logoH / firmaImg.height
          const w = firmaImg.width * scale
          context.drawImage(firmaImg, W * 0.04, logoY, w, logoH)
        }
        if (tursabImg) {
          const scale = (H * 0.04) / tursabImg.height
          const tw = tursabImg.width * scale
          context.drawImage(tursabImg, W - W * 0.04 - tw, logoY, tw, tursabImg.height * scale)
        }
      }

      // 3) Fiyat balonu — teal, %30 küçültülmüş
      const bubbleX = W * 0.54
      const bubbleY = H * 0.28
      const bubbleW = W * 0.42 * 0.7
      const bubbleH = H * 0.16 * 0.7
      const r = Math.min(bubbleW, bubbleH) * 0.15
      context.fillStyle = '#0d9488'
      context.strokeStyle = '#ffffff'
      context.lineWidth = Math.max(2, W * 0.004)
      roundRect(context, bubbleX, bubbleY, bubbleW, bubbleH, r)
      context.fill()
      context.stroke()

      context.fillStyle = '#ffffff'
      context.textAlign = 'center'
      context.font = `600 ${Math.round(W * 0.028)}px sans-serif`
      context.fillText('Kişi Başı Sadece', bubbleX + bubbleW / 2, bubbleY + bubbleH * 0.42)
      context.font = `bold ${Math.round(W * 0.068)}px sans-serif`
      context.fillText(
        `${kisiBasiFiyat.toLocaleString('tr-TR')}₺`,
        bubbleX + bubbleW / 2,
        bubbleY + bubbleH * 0.78
      )

      // 4) Otel ismi görselde asla yazılmaz (müşteriye verilmez).

      const lineHeight = H * 0.038

      // 5) Orta alan (kum): Sadece "3 GECE 4 GÜN" ve "YARIM PANSİYON" (+180px aşağı)
      const midY = H * 0.52 + 180
      context.fillStyle = '#1e293b'
      context.font = `bold ${Math.round(W * 0.048)}px sans-serif`
      context.textAlign = 'center'
      context.fillText(`${geceSayisi} GECE ${geceSayisi + 1} GÜN`, W / 2, midY)
      context.fillText(konaklamaTipi.toUpperCase(), W / 2, midY + lineHeight)

      // 6) Turuncu çerçeveli kutu — içinde aktiviteler + yan hizmetler; yükseklik yeterli olsun (yan haklar kesilmesin)
      const boxTop = H * 0.72
      const boxH = H * 0.178
      const boxPad = W * 0.035
      const boxX = W * 0.06
      const boxW = W * 0.88
      const boxR = W * 0.02
      const boxInnerW = boxW - boxPad * 2
      const boxLineH = Math.min(lineHeight * 1.15, (boxH - boxPad * 2) / 6)

      context.strokeStyle = '#ea580c'
      context.lineWidth = Math.max(2, W * 0.004)
      context.fillStyle = 'rgba(255,255,255,0.95)'
      roundRect(context, boxX, boxTop, boxW, boxH, boxR)
      context.fill()
      context.stroke()

      // Kutu içine clip — taşma olmasın; üst/alt iç boşluk ile yazılar yarım kesilmesin
      context.save()
      const clipX = boxX + boxPad
      const clipY = boxTop + boxPad
      const clipW = boxW - boxPad * 2
      const clipH = boxH - boxPad * 2
      const insetTop = 20
      const insetBottom = 28
      const contentClipY = clipY + insetTop
      const contentClipH = clipH - insetTop - insetBottom
      roundRect(context, clipX, contentClipY, clipW, contentClipH, Math.max(0, boxR - boxPad - 2))
      context.clip()

      // İlk satır clip içinde tam görünsün (üst/alt kesilme yok)
      const activityFontSize = Math.round(W * 0.032)
      let boxY = contentClipY + activityFontSize / 2 + 4 - boxLineH / 2
      // 6a) Kutu içi: Sadece aktivite adları (kalın, büyük harf, ortalı)
      context.fillStyle = '#1e293b'
      context.font = `bold ${activityFontSize}px sans-serif`
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      for (const ad of aktiviteAdlari) {
        context.fillText(ad.toUpperCase(), W / 2, boxY + boxLineH / 2)
        boxY += boxLineH
      }
      context.textBaseline = 'alphabetic'
      boxY += boxLineH * 0.4 + 55
      // 6b) Hemen altına: Yan hizmetler (+55px aşağı), font biraz büyük ama kutuda kalsın
      const inclusionLines = yanHizmetAdlari.length
        ? yanHizmetAdlari.join(' - ')
        : 'Açık Büfe Kahvaltı & Konaklama - Transferler'
      context.fillStyle = '#334155'
      const inclusionFontSize = Math.min(Math.round(W * 0.025), Math.round(boxLineH * 1.0))
      context.font = `${inclusionFontSize}px sans-serif`
      wrapTextCenter(context, inclusionLines, W / 2, boxY, boxInnerW, boxLineH * 0.98)
      context.restore()

      // 8) Alt iletişim çubuğu — telefon sol, web sağ, turuncu
      const barY = H * 0.90
      const barH = H * 0.065
      const barR = barH / 2
      context.fillStyle = '#ea580c'
      roundRect(context, 0, barY, W, barH, barR)
      context.fill()

      context.fillStyle = '#ffffff'
      context.font = `600 ${Math.round(W * 0.032)}px sans-serif`
      if (ayarlar.telefonNo) {
        context.textAlign = 'left'
        context.fillText(`📞 ${ayarlar.telefonNo}`, W * 0.06, barY + barH / 2 + 4)
      }
      if (ayarlar.webAdresi) {
        context.textAlign = 'right'
        const web = ayarlar.webAdresi.replace(/^https?:\/\//i, '')
        context.fillText(`${web} 🌐`, W * 0.94, barY + barH / 2 + 4)
      }

      // Logoları yükle ve çiz (şablonun üzerine)
      Promise.all([
        ayarlar.firmaLogosu ? loadImage(ayarlar.firmaLogosu) : null,
        ayarlar.tursabLogosu ? loadImage(ayarlar.tursabLogosu) : null,
      ])
        .then(([firma, tursab]) => {
          if (!cancelled) drawLogos(firma ?? null, tursab ?? null)
          setDataUrl(canvasEl.toDataURL('image/png'))
        })
        .catch(() => setDataUrl(canvasEl.toDataURL('image/png')))
    }

    templateImg.onerror = () => {
      if (cancelled) return
      // Şablon yoksa düz arka plan + aynı yerleşim
      const W = 800
      const H = 1200
      canvas.width = W
      canvas.height = H
      context.fillStyle = '#fefce8'
      context.fillRect(0, 0, W, H)
      context.fillStyle = '#78716c'
      context.font = '24px sans-serif'
      context.textAlign = 'center'
      context.fillText('paket.jpg bulunamadı — public/paket.jpg ekleyin', W / 2, H / 2)
      setDataUrl(canvasEl.toDataURL('image/png'))
    }

    templateImg.src = '/paket.jpg'

    return () => { cancelled = true }
  }, [geceSayisi, konaklamaTipi, aktiviteAdlari, yanHizmetAdlari, kisiBasiFiyat, ayarlar])

  const handleDownload = () => {
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `tur-paket-${Date.now()}.png`
    a.click()
  }

  const handleShare = async () => {
    if (!dataUrl) return
    try {
      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], 'tur-paket.png', { type: 'image/png' })
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: 'Tur Paketi', files: [file] })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        alert('Link panoya kopyalandı.')
      }
    } catch (e) {
      console.error(e)
      handleDownload()
    }
  }

  return (
    <div className="paket-gorsel-wrap">
      <canvas ref={canvasRef} className="paket-canvas" />
      <div className="paket-gorsel-actions">
        <button type="button" className="btn-primary" onClick={handleDownload}>İndir</button>
        <button type="button" className="btn-primary" onClick={handleShare}>Paylaş</button>
      </div>
    </div>
  )
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

/** Satırları sarıp her satırı centerX'e göre ortalar */
function wrapTextCenter(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  startY: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const test = line + (line ? ' ' : '') + word
    const m = ctx.measureText(test)
    if (m.width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  ctx.textAlign = 'center'
  let currentY = startY
  for (const ln of lines) {
    ctx.fillText(ln, centerX, currentY)
    currentY += lineHeight
  }
}
