# Maarif Ders Merkezi

Türkiye Yüzyılı Maarif Modeli ile ilişkili ders materyallerini aramak ve incelemek için hazırlanmış, bağımlılıksız bir statik web sitesi. Arayüz HTML, CSS ve tarayıcı JavaScript'i kullanır; derleme adımı veya npm bağımlılığı yoktur.

> **Katalog durumu:** `data/materials.json` şu anda boş. Gerçekliği ve kaynağı doğrulanmamış örnek kayıtlar eklenmez; site, katalogda içerik bulunmadığını açıkça gösterir.

## Özellikler

- Sınıf, ders ve ünite filtreleri birbirine bağlı çalışır.
- Yazarken arama ve Türkçe karakter normalleştirmesi desteklenir.
- Başlık, açıklama, sınıf, ders, ünite, konu, kazanım, anahtar kelime ve kaynak adı aranabilir.
- Arama eşleşmeleri güvenli DOM metin düğümleri ve `<mark>` öğeleriyle vurgulanır; katalog içeriği `innerHTML` ile eklenmez.
- Site içi dosyalar indirme bağlantısı, HTTPS harici kaynaklar ise yeni sekmede açılan kaynak bağlantısı olarak sunulur.
- Klavye odak göstergeleri, ana içeriğe atlama bağlantısı, mobil düzen, karanlık tema ve hareket azaltma tercihi desteği bulunur.
- Harici JavaScript/CSS kütüphanesi veya derleme aracı kullanılmaz.

## Materyal kataloğuna kayıt ekleme

Kayıtları `data/materials.json` dosyasına ekleyin. Yalnızca gerçek, erişilebilir ve kullanım amacı incelenmiş materyaller ekleyin. Dosya ya da kaynak URL'sinin varlığı bu doğrulama betiği tarafından internet üzerinden kontrol edilmez.

Örnek kayıt şeması:

```json
[
  {
    "title": "Materyalin adı",
    "description": "Kısa ve doğrulanabilir açıklama",
    "subject": "Matematik",
    "grade": "5. sınıf",
    "unit": "Ünite adı",
    "topic": "Konu adı",
    "outcomeCode": "Resmî programdaki kazanım kodu",
    "outcomeTopic": "Resmî programdaki kazanım ifadesi",
    "outcome": "Kazanım açıklaması",
    "keywords": ["anahtar kelime", "eş anlamlı ifade"],
    "url": "materials/dosya-adi.pdf",
    "format": "PDF",
    "fileSize": "PDF",
    "sourceName": "Kaynak kurum",
    "sourceUrl": "https://example.gov.tr/kaynak",
    "updatedAt": "2026-10-09"
  }
]
```

Bu örnekteki `example.gov.tr` bir yer tutucudur; gerçek bir kaynak URL'siyle değiştirilmeden yayına alınmamalıdır. `title` ve `url` zorunludur. Diğer alanlar isteğe bağlıdır. `keywords` bir metin dizisi olmalıdır. `updatedAt` için `YYYY-MM-DD` biçimi kullanılır. Mutlak URL'ler HTTPS kullanmalıdır; göreli URL'ler yayımlanan site yolu içinde kalmalıdır.

Kazanım kodunu ve kazanım ifadesini ilgili resmî öğretim programında yer aldığı biçimiyle girin. Kaynak ve güncelleme bilgilerini yalnızca doğrulanabiliyorsa ekleyin. Site, resmî MEB yayını değildir; içerikler kullanılmadan önce öğretmen tarafından kontrol edilmelidir.

Resmî kaynak: https://tymm.meb.gov.tr/ogretim-programlari/

## Yerel kontrol

Node.js 22 ile aşağıdaki komutları çalıştırın:

```sh
node --check app.js
node scripts/validate-site.mjs
```

Doğrulama betiği temel HTML/SEO gerekliliklerini, erişilebilirlik işaretlerini, CSS özelliklerini, URL şemasını, yinelenen başlık/URL kayıtlarını, katalog alanlarını, sitemap ve CI izinlerini kontrol eder. Harici URL'lerin yanıt verdiğini, PDF'lerin açıldığını veya görsel erişilebilirlik/perfomans ölçümlerini **kanıtlamaz**.

## GitHub Pages yayını

1. Depoda **Settings → Pages** bölümünü açın.
2. Build and deployment alanında **Deploy from a branch** seçin.
3. Branch olarak `main`, klasör olarak `/(root)` seçin.
4. Kaydedin ve yayımlanan adresi aynı ekrandan doğrulayın.

Yayın ayarları bu değişiklik kapsamında değiştirilmez.

## Dosya yapısı

- `index.html` — anlamsal sayfa yapısı ve SEO meta verileri
- `styles.css` — duyarlı tasarım, açık/koyu tema ve hareket tercihi
- `app.js` — arama, filtreleme, güvenli kart üretimi ve URL denetimi
- `data/materials.json` — materyal kataloğu
- `scripts/validate-site.mjs` — bağımlılıksız kalite doğrulaması
- `.github/workflows/site-quality.yml` — GitHub Actions kalite kontrolü

## Otomatik kalite kontrolleri

GitHub Actions, pull request'lerde ve `main` dalına push yapıldığında JavaScript sözdizimini ve statik site/katalog doğrulamasını çalıştırır. Workflow ayrıca elle başlatılabilir. Bu kontroller gerçek tarayıcıda ekran okuyucu, WCAG 2.2 AA, Lighthouse/Core Web Vitals, HTTP güvenlik başlıkları, bağlantı erişilebilirliği veya gerçek cihaz testlerinin yerine geçmez.

## Bilinen sınırlamalar ve sonraki adımlar

- Katalog boş olduğu için kullanıcıya sunulacak gerçek materyaller henüz yoktur. Kaynak ve içerik seçimi insan incelemesi gerektirir; otomatik olarak içerik uydurulmaz.
- GitHub Pages güvenlik başlıkları uygulama dosyalarından bütünüyle yönetilemez. Canlı yanıt başlıkları ve yönlendirmeler yayımlanan alan adı üzerinde ayrıca denetlenmelidir.
- Lisans belirtilmemiştir. Proje sahibi uygun lisansı seçmeden bir lisans dosyası eklenmemiştir.
- Tam WCAG 2.2 AA uygunluğu, W3C HTML doğrulaması, gerçek cihaz/tarayıcı testi ve performans ölçümü ayrı araçlarla tamamlanmalıdır.
