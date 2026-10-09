# Maarif Ders Merkezi

Türkiye Yüzyılı Maarif Modeli ile ilişkili ders materyallerini aramak ve indirmek için hazırlanmış, bağımlılıksız statik web sitesi.

## Arayüz ve arama

- Filtre sırası: sınıf → ders → ünite → öğrenme çıktısı / kazanım kodu
- Filtreler birbirine bağlıdır; üst filtre değiştiğinde alt filtreler sıfırlanır.
- Arama yazdıkça güncellenir ve büyük/küçük harf farkını gözetmez.
- Arama; Türkçe karakter normalleştirmesiyle başlık, açıklama, ders, sınıf, ünite, konu, kazanım, kazanım kodu ve anahtar kelimeleri tarar.
- Eşleşen metinler güvenli DOM metin düğümleri ve `<mark>` öğeleriyle vurgulanır.
- Materyal türü filtresi ve ayrı “Hakkında” bölümü kaldırılmıştır.
- Mobil uyumlu düzen ve klavye erişilebilirliği; harici kütüphane veya derleme adımı yoktur.

## Kaynak ve yapay zekâ kullanımı

Site ve materyal içerikleri yapay zekâ desteğiyle, Millî Eğitim Bakanlığının Türkiye Yüzyılı Maarif Modeli için yayımladığı resmî öğretim programları ve dokümanları esas alınarak hazırlanır. Bu site resmî MEB sitesi değildir. İçerikler kullanılmadan önce öğretmen tarafından kontrol edilmelidir.

Resmî kaynak: https://tymm.meb.gov.tr/ogretim-programlari/

## Materyal ekleme

Dosyaları `materials/` dizinine yükleyin ve `data/materials.json` listesine kayıt ekleyin. Başlangıçta örnek veya kurmaca materyal bulunmaz.

Her kayıt için `title` ve `url` zorunludur. Diğer alanlar isteğe bağlıdır:

```json
[
  {
    "title": "Materyalin adı",
    "description": "Kısa açıklama",
    "subject": "Matematik",
    "grade": "5. sınıf",
    "unit": "Ünite adı",
    "topic": "Konu adı",
    "outcomeCode": "Öğretim programındaki resmî kod",
    "outcome": "İlgili öğrenme çıktısı/kazanım metni",
    "keywords": ["anahtar kelime", "başka ifade"],
    "url": "materials/dosya-adi.pdf",
    "fileSize": "PDF"
  }
]
```

Öğrenme çıktısı kodunu yalnızca ilgili resmî öğretim programında yer aldığı biçimiyle girin. Maarif Modeli dokümanlarında kullanılan resmî terim “öğrenme çıktısı”dır. Mevcut olmayan dosyalara bağlantı vermeyin.

## GitHub Pages yayını

1. Depoda Settings → Pages bölümünü açın.
2. Build and deployment alanında Deploy from a branch seçin.
3. Branch olarak `main`, klasör olarak `/(root)` seçip kaydedin.
4. Yayın adresi aynı bölümde görünür.

## Dosya yapısı

- `index.html` — sayfa yapısı
- `styles.css` — duyarlı tasarım
- `app.js` — arama, filtreler ve materyal kartları
- `data/materials.json` — materyal kataloğu
- `materials/` — indirilebilir dosyalar için dizin
