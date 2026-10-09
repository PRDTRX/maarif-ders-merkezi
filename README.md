# Maarif Ders Merkezi

Türkiye Yüzyılı Maarif Modeli ile ilişkili ders materyallerini aramak ve indirmek için tasarlanmış, bağımlılıksız statik web sitesi.

## Özellikler

- Ders, sınıf, tür, ünite, konu, kazanım ve anahtar kelimelerde arama
- Türkçe karakterleri ve farklı yazımları tolere eden arama
- Birlikte kullanılabilen filtreler
- Mobil uyumlu düzen ve klavye erişilebilirliği
- Harici kütüphane veya derleme adımı gerektirmez

## Materyal ekleme

Dosyaları `materials/` dizinine yükleyin ve `data/materials.json` listesine kayıt ekleyin. Başlangıçta örnek veya kurmaca materyal bulunmaz.

Her kayıt için `title` ve `url` zorunludur. Diğer alanlar isteğe bağlıdır:

    [
      {
        "title": "Materyalin adı",
        "description": "Kısa açıklama",
        "subject": "Matematik",
        "grade": "5. sınıf",
        "unit": "Ünite adı",
        "topic": "Konu adı",
        "outcome": "İlgili kazanım",
        "type": "Çalışma kâğıdı",
        "keywords": ["anahtar kelime", "başka ifade"],
        "url": "materials/dosya-adi.pdf",
        "fileSize": "PDF"
      }
    ]

Arama, başlık, açıklama, ders, sınıf, ünite, konu, kazanım, tür, dosya adı ve anahtar kelimeleri tarar. Depodaki dosyalar için göreli bağlantı kullanın.

## GitHub Pages yayını

1. Depoda Settings → Pages bölümünü açın.
2. Build and deployment alanında Deploy from a branch seçin.
3. Branch olarak `main`, klasör olarak `/(root)` seçip kaydedin.
4. Yayın adresi aynı bölümde görünür. İlk yayın birkaç dakika sürebilir.

## Dosya yapısı

- `index.html` — sayfa yapısı
- `styles.css` — responsive tasarım
- `app.js` — arama, filtreler ve materyal kartları
- `data/materials.json` — materyal kataloğu
- `materials/` — indirilebilir dosyalar için önerilen dizin

Kütüphane ve çerçeve bağımlılığı eklemeden statik yapıyı koruyun. Mevcut olmayan dosyalara bağlantı vermeyin.