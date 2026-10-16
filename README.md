# Maarif Ders Merkezi

Türkiye Yüzyılı Maarif Modeli kapsamında öğretmenlerin süreç odaklı değerlendirme araçlarını, etkinlikleri ve çalışma kâğıtlarını tek bir yerde keşfetmesi için hazırlanmış, içerik eklemeye hazır bir kaynak kütüphanesi.

## Tasarım yaklaşımı

Bu arayüz, Apple ürün sayfalarındaki görsel hiyerarşi ve ritimden esinlenen özgün bir tasarımdır: geniş boşluklar, büyük tipografi, az ama anlamlı renk, editoryal bölüm geçişleri ve kaynak arşivinin gerçek bir ürün gibi gösterildiği özel bir arayüz ön izlemesi. Apple markası veya tasarım dosyaları kopyalanmamıştır.

## Özellikler

- Türkçe arama ve kategori, araç türü, sınıf düzeyi, ders filtreleri.
- Belgeleri koddan ayrı tutan `content/` klasörü ve `data/catalog.json` metadata dosyası.
- Yeni kaynak kayıtları için `templates/resource.schema.json` veri şeması.
- Mobil gezinme, klavye odağı, anlamlı başlıklar ve hareket azaltma tercihi desteği.
- Bağımlılıksız statik site; Node/Python derleme adımı gerektirmeden GitHub Pages'e dağıtılabilir.
- Her ekleme öncesi JavaScript sözdizimi ve JSON doğrulaması yapan GitHub Actions akışı.

## Yerelde çalıştırma

Kök klasörde:

```bash
python -m http.server 8000
```

Sonra `http://localhost:8000` adresini aç.

## Kaynak ekleme

1. Dosyanı `content/` altındaki uygun klasöre ekle.
2. `data/catalog.json` içindeki `resources` dizisine `CONTRIBUTING.md` dosyasındaki şablona uyan metadata kaydı ekle.
3. Sınıf, ders, araç türü, kaynak türü ve tarih alanlarını doldur.
4. Yerel sunucuda arama ve filtreleri doğrula.

Başlangıç kataloğunda gerçek öğretmen belgesi yoktur. Site, içerikler eklendikçe kaynak listesinde göstermeye hazırdır.

## Yayınlama

GitHub Actions, JavaScript ve JSON dosyalarını kontrol eder. GitHub Pages repo için bir kez etkinleştirildiğinde dağıtım işine geçer. Repository Settings → Pages altında Source olarak GitHub Actions seçilmelidir. Pages ayarı otomatik etkinleştirilemezse repo sahibi tarafından bir kez açılması gerekir.

## İçerik güvenliği ve doğruluk

Bu proje MEB'in resmî sitesi değildir. Resmî, uyarlanmış, özgün ve haricî kaynak türlerini doğru işaretleyin; telif koşullarına uyun. Öğrenci kişisel verilerini kamuya açık depoya koymayın. Eğilim, değer ve sosyal-duygusal beceriler için gözlenebilir göstergeler, bağlama uygun kanıtlar, açık ölçütler ve geliştirici geri bildirim kullanın.
