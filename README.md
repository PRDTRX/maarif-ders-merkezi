# Maarif Ders Merkezi

Türkiye Yüzyılı Maarif Modeli ile ilişkili ders materyallerini sınıf, ders, ünite ve öğrenme çıktısına göre keşfetmek için hazırlanmış, bağımlılıksız statik bir web kataloğu.

- **Arayüz:** HTML, CSS ve tarayıcı JavaScript'i
- **Veri:** data/materials.json
- **Yayın:** GitHub Pages
- **Derleme / npm bağımlılığı:** Yok
- **Kişisel veri:** Site arama ve filtreleri tarayıcıda işler; uygulama hesabı veya sunucu tarafı kullanıcı profili içermez.

> **Katalog durumu:** data/materials.json şu an bilerek boş bir dizidir ([]). Doğrulanmamış materyal, örnek içerik veya çalıştığı kanıtlanmamış bağlantı yayımlanmaz.

## Ürün ilkeleri

1. **Kaynağı görünür tut:** Her materyalin kaynak adı ve asıl kaynak URL'si zorunludur.
2. **Kullanım hakkını kontrol et:** Bir dosyanın internette bulunması, dosyanın yeniden yayımlanabileceği anlamına gelmez. Depoya yalnızca yeniden dağıtım hakkı doğrulanmış dosyalar eklenmelidir. Aksi durumda dosyayı kopyalamak yerine kaynak sayfasına bağlantı ver.
3. **İnsan doğrulaması olmadan yayımlama:** Her kayıt için verificationStatus: "doğrulandı" ve kontrol tarihi gereklidir.
4. **Müfredat bağlamını kaydet:** Sınıf, ders, ünite ve öğrenme çıktısı alanlarını doğrulanabilir resmî programla karşılaştır.
5. **Güncelliği takip et:** verifiedAt kaydın insan tarafından en son kontrol edildiği tarihtir; updatedAt ise materyalin güncellenme tarihidir. Bu tarihler farklı anlamlar taşır.
6. **Resmî kaynakla karıştırma:** Maarif Ders Merkezi resmî MEB sitesi değildir. Yapay zekâ desteği, kaynak kontrolü veya öğretmen değerlendirmesinin yerine geçmez.

## Dosya yapısı

- index.html — erişilebilir sayfa iskeleti ve SEO metadata
- styles.css — tasarım sistemi, duyarlı düzen, açık/koyu tema ve hareket tercihleri
- app.js — arama, filtreleme, sıralama, URL durumu, kart üretimi ve istemci tarafı doğrulama
- data/materials.json — yayımlanacak materyal kayıtları
- data/materials.schema.json — editör ve araçlar için JSON Schema
- scripts/validate-site.mjs — bağımlılıksız yerel kalite ve katalog doğrulaması
- .github/workflows/site-quality.yml — pull request ve main push olaylarında statik kontroller

## Materyal ekleme

Kayıtları data/materials.json dosyasına JSON nesneleri olarak ekle. Katalog bir JSON dizisidir. Zorunlu alanlar:

| Alan | Kural |
| --- | --- |
| title | Boş olamaz; en fazla 180 karakter |
| url | HTTPS URL veya yayımlanan site yolu içindeki mevcut yerel dosya |
| sourceName | Kaynak kurumun veya yayıncının adı |
| sourceUrl | Asıl kaynağa giden HTTPS bağlantısı |
| usageRights | Dosyanın yeniden yayımlanması ya da yalnızca bağlantılanması gibi kullanım koşullarının açık kaydı |
| verifiedAt | İnsan doğrulamasının yapıldığı geçerli YYYY-MM-DD tarihi |
| verificationStatus | Yayımlanabilir kayıtlar için yalnızca doğrulandı |

Örnek şema gösterimi (yer tutucular gerçek materyal değildir ve olduğu gibi yayımlanmamalıdır):

    [
      {
        "title": "Gerçek materyalin başlığı",
        "description": "Materyalin kapsamını doğru ve kısa biçimde açıklayan metin.",
        "subject": "Matematik",
        "grade": "5. sınıf",
        "unit": "Gerçek ünite adı",
        "topic": "Gerçek konu adı",
        "outcomeCode": "Resmî programdaki kod",
        "outcomeTopic": "Resmî programdaki öğrenme çıktısı",
        "keywords": ["arama terimi", "eş anlamlı terim"],
        "url": "materials/gercek-dosya.pdf",
        "format": "PDF",
        "fileName": "gercek-dosya.pdf",
        "fileSize": "2.4 MB",
        "sourceName": "Kaynak kurum",
        "sourceUrl": "https://example.org/gercek-kaynak",
        "academicYear": "2026-2027",
        "curriculumVersion": "İlgili programın doğrulanmış sürümü",
        "updatedAt": "2026-10-01",
        "verifiedAt": "2026-10-09",
        "verificationStatus": "doğrulandı",
        "license": "Doğrulanmış lisans adı veya koşulu",
        "usageRights": "Yeniden yayımlama izni doğrulandı; izin kaydı editoryal arşivde."
      }
    ]

Örnekteki example.org adresi yer tutucudur. Gerçek kaynakla değiştirilmeden kullanılmamalıdır. Yerel url kullanıyorsan dosya depoda gerçekten bulunmalı ve site içinde yayımlanıyor olmalıdır. Haricî dosyalarda HTTPS bağlantısı kullanılır; kaynak bağlantısı ayrıca tutulur. Haricî URL'lerin erişilebilirliği veya dosya içeriğinin doğruluğu statik betik tarafından internet üzerinden garanti edilmez.

### Alanların anlamı

- **url:** Kullanıcının açacağı veya indireceği materyal.
- **sourceUrl:** Materyalin alındığı asıl yayın veya kaynak sayfası. Kullanıcı arayüzünde ayrıca gösterilir.
- **license:** Biliniyorsa lisansın adı.
- **usageRights:** Uygulamadaki kullanım ve yeniden dağıtım durumuna ilişkin somut editoryal kayıt. Lisans adı tek başına hak sahipliğini veya izin kapsamını kanıtlamaz.
- **updatedAt:** İçeriğin güncellenme tarihi.
- **verifiedAt:** Kaynağın, URL'nin, kullanım koşullarının ve müfredat bağlamının kontrol edildiği tarih.
- **academicYear / curriculumVersion:** Gerektiğinde materyalin ilgili olduğu eğitim-öğretim yılı ve program sürümü.

verificationStatus alanını doğrulama tamamlanmadan doğrulandı olarak ayarlama. Yayımlama öncesinde kaynağı, URL'yi, dosyayı, kullanım koşullarını ve program eşleştirmesini gerçek bir kişi kontrol etmelidir. Eğitim içeriği veya kaynak URL'si uydurulmaz.

Resmî program kaynağı: https://tymm.meb.gov.tr/ogretim-programlari/

## Yerel kalite kontrolleri

Node.js 22 ile depo kökünde çalıştır:

    node --check app.js
    node scripts/validate-site.mjs

Doğrulama betiği HTML için temel yapısal gereklilikleri, benzersiz kimlikleri, yerel dosya bağlantılarını, erişilebilirlik işaretlerini, katalog alanlarını, kaynak URL'lerini, tarihleri, tekrar eden başlık/URL kayıtlarını ve CI izinlerini kontrol eder. Katalog boşsa başarısız olmak yerine açık bir uyarı verir.

Bu kontroller **şunları kanıtlamaz**: haricî URL'lerin canlı olduğunu, PDF'lerin doğru içeriğe sahip olduğunu, kullanım haklarının hukuken geçerli olduğunu, WCAG 2.2 AA uygunluğunu, ekran okuyucu davranışını, Lighthouse/Core Web Vitals skorlarını veya gerçek cihazlarda görsel tutarlılığı. Bunlar ayrıca kontrol edilmelidir.

## GitHub Pages

Depo main dalının kökünden yayımlanacak şekilde tasarlanmıştır. GitHub'da **Settings → Pages** altında etkin yayın kaynağını doğrula. Yayın URL'si veya depo yolu değiştirilirse canonical, og:url, robots.txt ve sitemap.xml birlikte güncellenmelidir.

Kalite workflow'u dosya değişikliklerini denetler fakat dal korumasını etkinleştirmez. main için gerekli durum kontrolü ve PR üzerinden birleştirme kuralı GitHub depo ayarlarında ayrıca açılmalıdır.

## Bilinen sınırlar ve kararlar

- Katalog bilerek boştur; doğrulanmış içerikleri sahibi ekleyecektir.
- Site kullanıcı hesabı, veritabanı, analitik veya sunucu tarafı arama içermez.
- Otomatik testler statik kontrollerdir; gerçek tarayıcı testlerinin yerine geçmez.
- GitHub Pages sunucu güvenlik başlıklarının tümünü depo dosyalarından kontrol etmek mümkün değildir. Canlı yanıt başlıkları ayrıca incelenmelidir.
- Proje kodu için lisans henüz belirtilmemiştir. Proje sahibi uygun lisansa karar vermeden lisans dosyası eklenmemiştir. Kod lisansı ile katalog materyallerinin kullanım hakları ayrı konulardır.
