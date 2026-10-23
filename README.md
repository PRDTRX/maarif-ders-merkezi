# Maarif Ders Merkezi

5, 6 ve 7. sınıf çalışma kâğıtları için statik bir arama sitesi (HTML/CSS/JavaScript; derleme adımı gerektirmez).

> **Önemli:** data.js şu an örnek kayıtlar içerir. İçeriği yayınlamadan önce kazanım kodlarını ve metinlerini MEB TTKB programlarından doğrulayın, gerçek PDF dosyalarını ekleyin ve örnek verilerdeki başlıkları/çalışma kâğıtlarını kontrol edin.

## Yayınlama (GitHub Pages)

1. Repo ayarlarında **Settings → Pages** bölümünü açın.
2. Kaynak olarak **Deploy from a branch** seçin.
3. Dalı **main** ve klasörü **/(root)** olarak ayarlayın.
4. Yayınlanan adres: https://prdtrx.github.io/maarif-ders-merkezi/

## İçerik ekleme

- PDF dosyalarını **pdf/** klasörüne ekleyin.
- data.js içine her çalışma kâğıdı için benzersiz ve kalıcı bir **id** ekleyin.
- **f** alanı için **pdf/dosya-adi.pdf** gibi bir göreli yol kullanın. Uygulama yalnızca pdf/ altındaki PDF yollarını veya doğrudan HTTPS .pdf bağlantılarını kabul eder; hatalı/güvensiz adresleri devre dışı bırakır.
- **dl** ve **fv** alanlarını yalnızca gerçek ve doğrulanmış sayımlar mevcutsa ekleyin. Bunlar statik JavaScript verisinden otomatik güncellenmez.
- Her kayıt için benzersiz ve kalıcı bir kimlik zorunludur. Eksik, geçersiz veya yinelenen kimlikler otomatik olarak yeniden adlandırılmaz; kayıt atlanır ve konsola uyarı yazılır.

## Özellikler ve teknik notlar

- Sınıf, ders, ünite ve arama metni filtreleri birbirleriyle uyumlu çalışır.
- Sıralama tercihi: alan ağırlıklı ilgililik puanı, en yeni ve başlık A–Z.
- Filtreler ve açık çalışma kâğıdı bağlantısı URL sorgu parametrelerine yazılır; eski #q=... türündeki paylaşım bağlantıları da okunur.
- Favoriler ve tema tercihi tarayıcının localStorage alanında saklanır; hesap veya sunucu tarafı gerekmez.
- index.html, robots.txt ve sitemap.xml aynı GitHub Pages adresini kullanır.
- Listeyi yazdır o an filtrelenmiş sonuçları iki sütunlu yazdırma düzeninde çıkarır.

## Kalite kontrolleri

Proje bağımlılık gerektirmeyen Node.js kalite kontrolleri kullanır (Node.js 20 veya üstü önerilir).

- `node --check app.js` ve `node --check data.js`: JavaScript sözdizimini kontrol eder.
- `node --test`: veri şemasını, benzersiz kimlikleri, tarihleri, PDF yol biçimlerini ve temel HTML varlık bağlantılarını doğrular.
- GitHub Actions, her push ve pull request'te bu kontrolleri çalıştırır.

Bu kontroller kazanım metinlerinin resmî müfredata uygunluğunu veya PDF içeriğinin pedagojik doğruluğunu doğrulamaz; bunlar yayın öncesi editoryal kontrol gerektirir.

## Elle doğrulama listesi

1. Sınıf seçin; ders ve ünite seçeneklerinin buna göre güncellendiğini doğrulayın.
2. Türkçe karakterli bir kelimeyle arama yapın, ardından filtreleri temizleyin.
3. Favori ekleyip sayfayı yenileyin; favorinin korunduğunu doğrulayın.
4. Bir çalışma kâğıdı ayrıntısını açın, bağlantıyı kopyalayıp yeni sekmede açın ve geri tuşunu deneyin.
5. PDF alanını boş bırakın ve güvenli olmayan bir bağlantı girin; açma bağlantısının gösterilmediğini doğrulayın.
6. Açık/koyu tema, dar ekran, klavye odağı ve yazdırma görünümünü kontrol edin.

Kazanım eşleştirmeleri yayınlanmadan önce resmî programla ayrıca karşılaştırılmalıdır; uygulama bu içeriklerin doğruluğunu kendi başına garanti etmez.
