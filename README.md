# Maarif Ders Merkezi

Öğretmenlerin ders hazırlığı için sınıf, ders, ünite ve kazanıma göre kaynak arayabildiği statik bir materyal arşivi (HTML/CSS/JavaScript; derleme adımı gerektirmez).

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
- Filtreler ve açık çalışma kâğıdı bağlantısı URL sorgu parametrelerine yazılır; ayrıntı penceresi açıldığında tarayıcı geçmişine kaydedilir ve Geri/İleri gezinmesiyle geri yüklenir. Eski #q=... türündeki paylaşım bağlantıları da okunur.
- Favoriler ve tema tercihi tarayıcının localStorage alanında saklanır; hesap veya sunucu tarafı gerekmez.
- index.html, robots.txt ve sitemap.xml aynı GitHub Pages adresini kullanır.
- Listeyi yazdır o an filtrelenmiş sonuçları iki sütunlu yazdırma düzeninde çıkarır.

## Tasarım sistemi ve erişilebilirlik

- Görsel yön öğretmenlerin materyal bulma ve ders hazırlama akışına göre tasarlanmıştır: açık mavi-gri giriş alanı, beyaz katalog yüzeyleri ve ölçülü teal vurgu.
- Logo, sade bir M monogramı olarak ele alınır; Manrope başlıkları, DM Sans gövde metnini ve IBM Plex Mono arayüz metaverilerini birbirinden ayırır. Daha yumuşak köşeler, sakin kontrast ve net boşluklar görsel hiyerarşiyi taşır.
- Koyu tema desteklenir; tema tercihi tarayıcının localStorage alanında saklanır ve kullanıcı seçimi yoksa sistem tercihi kullanılır.
- Klavye kullanıcıları için ölçülü ve görünür `:focus-visible` stilleri ile ana içeriğe atlama bağlantısı bulunur. Fareyle seçim yapıldığında gereksiz odak halkası gösterilmez. Hareket azaltma tercihi dikkate alınır.
- Katalog geniş ekranlarda iki sütunlu, telefonda tek sütunlu çalışır. Yazdırma görünümünde iki sütunlu çıktı ve tek kartı sayfaya yayma kuralı korunur.
- Otomatik kontroller görsel kaliteyi veya WCAG uygunluğunu tek başına kanıtlamaz. Yayın öncesinde gerçek tarayıcıda kontrast, klavye erişimi ve 320 px, 375 px, 768 px ve geniş ekranlarda taşma kontrol edilmelidir.
- Katalogdaki mevcut kayıtlar örnektir; gerçek PDF'ler ve kazanım eşleştirmeleri doğrulanmadan içerikler gerçek eğitim kaynağı olarak sunulmamalıdır.

## Kalite kontrolleri

Proje bağımlılık gerektirmeyen Node.js kalite kontrolleri kullanır (Node.js 20 veya üstü önerilir).

- `node --check app.js` ve `node --check data.js`: JavaScript sözdizimini kontrol eder.
- `node --test`: veri şemasını, benzersiz kimlikleri, tarihleri, PDF yol biçimlerini ve temel HTML varlık bağlantılarını doğrular. Tanımlanan yerel PDF yollarının dosya olarak mevcut olduğunu, PDF URL güvenlik kontrollerini ve yazdırma düzenini de denetler.
- GitHub Actions, her push ve pull request'te bu kontrolleri çalıştırır.

Bu kontroller kazanım metinlerinin resmî müfredata uygunluğunu veya PDF içeriğinin pedagojik doğruluğunu doğrulamaz; bunlar yayın öncesi editoryal kontrol gerektirir.

## Elle doğrulama listesi

Tasarım değişikliklerinden sonra masaüstü ve mobil tarayıcılarda, özellikle 320 px, 375 px, 768 px ve geniş masaüstü ekranlarında test yapın. Klavye ile tüm kontrollere ulaşın, odak göstergesini doğrulayın ve açık/koyu temada metin ile düğme kontrastını ölçün.

1. Sınıf seçin; ders ve ünite seçeneklerinin buna göre güncellendiğini doğrulayın.
2. Türkçe karakterli bir kelimeyle arama yapın; yazarken sayfanın kendiliğinden kaymadığını, Enter ile sonuçlara gidildiğini doğrulayın. Ardından filtreleri temizleyin.
3. Favori ekleyip sayfayı yenileyin; favorinin korunduğunu doğrulayın.
4. Bir çalışma kâğıdı ayrıntısını açın, bağlantıyı kopyalayıp yeni sekmede açın ve geri tuşunu deneyin.
5. PDF alanını boş bırakın ve güvenli olmayan bir bağlantı girin; açma bağlantısının gösterilmediğini doğrulayın. Kodlanmış boşluk içeren geçerli HTTPS PDF adreslerinin kabul edildiğini de kontrol edin.
6. Açık/koyu tema, dar ekran, klavye odağı ve iki sütunlu yazdırma görünümünü kontrol edin.

Kazanım eşleştirmeleri yayınlanmadan önce resmî programla ayrıca karşılaştırılmalıdır; uygulama bu içeriklerin doğruluğunu kendi başına garanti etmez.
