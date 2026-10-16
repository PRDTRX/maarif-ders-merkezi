# Maarif Ders Merkezi

Türkiye Yüzyılı Maarif Modeli kapsamında öğretmenlerin süreç odaklı değerlendirme araçlarını, etkinlikleri ve çalışma kâğıtlarını tek bir yerde keşfetmesi için hazırlanmış, içerik eklemeye hazır bir kaynak kütüphanesi.

## Proje yaklaşımı

- Apple ürün sayfalarından esinlenen sade, tipografi odaklı ve ferah arayüz.
- Türkçe arama ve kategori, sınıf düzeyi, ders, araç türü ile dosya biçimine göre filtreleme.
- İçeriklerin koddan ayrılması: kategori tanımları `data/catalog.json` içinde, kaynak dosyaları `content/` altında tutulur.
- Statik site: derleme adımı veya uygulama sunucusu gerektirmez; GitHub Pages üzerinde yayımlanabilir.
- Erişilebilir, mobil uyumlu ve harici JavaScript/CSS kütüphanelerine bağımlı olmayan başlangıç.

## Yerel çalıştırma

`index.html` dosyasını doğrudan `file://` ile açmak yerine bir yerel HTTP sunucusu kullanın. Örneğin Python kuruluysa proje kök dizininde:

```bash
python -m http.server 8000
```

Ardından `http://localhost:8000` adresini açın.

## İlk içerik nasıl eklenir?

1. PDF, DOCX, XLSX veya benzeri kaynak dosyasını `content/` altına ekleyin. Dosyaları konuya göre alt klasörlerde düzenleyebilirsiniz.
2. `data/catalog.json` içindeki `resources` dizisine `templates/resource.schema.json` ile uyumlu bir kayıt ekleyin.
3. Değişiklikleri yerel sunucuda arama ve filtrelerle kontrol edin.
4. `main` dalına gönderilen değişiklikler GitHub Pages dağıtım akışını tetikler.

Örnek kayıt yapısı ve alan açıklamaları için `CONTRIBUTING.md` dosyasına bakın. Şu an katalogda gerçek belge veya örnek puanlama aracı bulunmuyor; site iskeleti ve içerik yerleşimi hazır.

## Klasör yapısı

```text
.
├── index.html
├── 404.html
├── assets/
│   ├── css/styles.css
│   ├── js/app.js
│   └── images/                 # İsteğe bağlı yerel görseller
├── content/                    # Sonradan eklenecek öğretmen kaynakları
├── data/catalog.json           # Kategoriler ve kaynak metadata kayıtları
├── templates/resource.schema.json
├── .github/workflows/deploy.yml
├── CONTRIBUTING.md
└── RESEARCH_NOTES.md
```

## Yayınlama

GitHub deposunda **Settings → Pages → Build and deployment → Source: GitHub Actions** seçili olmalıdır. Ardından `main` dalına gönderilen her değişiklik otomatik olarak dağıtılır. İlk dağıtım tamamlandığında site adresi aynı Settings → Pages ekranında görünür.

## İçerik ilkeleri

Bu proje MEB'in resmî platformu değildir. Eklenen her kaydın resmî kaynak, uyarlama veya özgün çalışma olduğu metadata alanlarında açıkça belirtilmelidir. Eğilim, değer ve sosyal-duygusal beceriler için oluşturulacak ölçütler bağlama ve yaş düzeyine uygun olmalı; gözlenebilir göstergeler, birden fazla öğrenme kanıtı ve açıklayıcı geri bildirim esas alınmalıdır. Öğrenci kimlik bilgileri veya kişisel veriler kaynak dosyalarına eklenmemelidir.
