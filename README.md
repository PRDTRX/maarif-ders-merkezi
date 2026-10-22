# Maarif Ders Merkezi

5, 6 ve 7. sınıf etkinlik kâğıtları için statik bir arama sitesi (HTML/CSS/JavaScript; derleme adımı gerektirmez).

> **Önemli:** data.js şu an örnek kayıtlar içerir. İçeriği yayınlamadan önce kazanım kodlarını ve metinlerini MEB TTKB programlarından doğrulayın, gerçek PDF dosyalarını ekleyin ve örnek verilerdeki başlıkları/etkinlikleri kontrol edin.

## Yayınlama (GitHub Pages)

1. Repo ayarlarında **Settings → Pages** bölümünü açın.
2. Kaynak olarak **Deploy from a branch** seçin.
3. Dalı **main** ve klasörü **/(root)** olarak ayarlayın.
4. Yayınlanan adres: https://prdtrx.github.io/maarif-ders-merkezi/

## İçerik ekleme

- PDF dosyalarını **pdf/** klasörüne ekleyin.
- data.js içine her etkinlik için benzersiz ve kalıcı bir **id** ekleyin.
- **f** alanı için **pdf/dosya-adi.pdf** gibi bir göreli yol kullanın. Uygulama yalnızca pdf/ altındaki PDF yollarını veya doğrudan HTTPS .pdf bağlantılarını kabul eder; hatalı/güvensiz adresleri devre dışı bırakır.
- **dl** ve **fv** alanlarını yalnızca gerçek ve doğrulanmış sayımlar mevcutsa ekleyin. Bunlar statik JavaScript verisinden otomatik güncellenmez.
- Örnek id değerleri zaten kayıtlıdır. Yeni kayıtlar için benzersiz harf, rakam, nokta, alt çizgi veya tire içeren kimlik kullanın.

## Özellikler ve teknik notlar

- Sınıf, ders, ünite ve arama metni filtreleri birbirleriyle uyumlu çalışır.
- Sıralama tercihi: ilgililik, en yeni ve başlık A–Z.
- Filtreler ve açık etkinlik bağlantısı URL sorgu parametrelerine yazılır; eski #q=... türündeki paylaşım bağlantıları da okunur.
- Favoriler ve tema tercihi tarayıcının localStorage alanında saklanır; hesap veya sunucu tarafı gerekmez.
- index.html, robots.txt ve sitemap.xml aynı GitHub Pages adresini kullanır.
- Listeyi yazdır o an filtrelenmiş sonuçları iki sütunlu yazdırma düzeninde çıkarır.

## Elle doğrulama listesi

1. Sınıf seçin; ders ve ünite seçeneklerinin buna göre güncellendiğini doğrulayın.
2. Türkçe karakterli bir kelimeyle arama yapın, ardından filtreleri temizleyin.
3. Favori ekleyip sayfayı yenileyin; favorinin korunduğunu doğrulayın.
4. Bir etkinlik ayrıntısını açın, bağlantıyı kopyalayıp yeni sekmede açın ve geri tuşunu deneyin.
5. PDF alanını boş bırakın ve güvenli olmayan bir bağlantı girin; açma bağlantısının gösterilmediğini doğrulayın.
6. Açık/koyu tema, dar ekran ve yazdırma görünümünü kontrol edin.

Kazanım eşleştirmeleri yayınlanmadan önce resmî programla ayrıca karşılaştırılmalıdır; uygulama bu içeriklerin doğruluğunu kendi başına garanti etmez.
