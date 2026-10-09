# Katkı rehberi

Maarif Ders Merkezi'ne katkıda bulunurken doğruluk, kaynak şeffaflığı, erişilebilirlik ve düşük bakım maliyetini önceliklendir.

## Kod değişiklikleri

- Küçük ve tek amaçlı pull request'ler aç.
- Yeni npm bağımlılığı eklemeden önce neden yerleşik tarayıcı veya Node.js özelliklerinin yeterli olmadığını açıkla.
- Kullanıcıdan gelen veya katalogdan gelen metni HTML olarak çalıştırma; metin düğümleri ve güvenli DOM API'leri kullan.
- Dış bağlantılarda HTTPS kullan; yeni sekmede açılan bağlantılara rel="noopener noreferrer" ekle.
- Klavye erişimini, görünür odak işaretlerini, koyu temayı, dar ekranları ve prefers-reduced-motion davranışını koru.
- URL'lerin ve sayfa yollarının GitHub Pages alt dizininde doğru çalıştığını kontrol et.
- Değişiklik açıklamasında testleri, bilinen sınırları ve manuel kontrol gerektiren durumları belirt.

## Materyal ekleme kuralları

Her kayıt, data/materials.schema.json şemasına uymalıdır. Yayımlanabilir her materyal aşağıdaki koşulları sağlamalıdır:

1. Gerçek ve erişilebilir materyal URL'si.
2. Kaynak kurum/yayıncı adı (sourceName) ve asıl kaynak sayfası (sourceUrl).
3. Dosyayı depoda yeniden dağıtma veya yalnızca dış kaynağa bağlantı verme koşullarının açık kaydı (usageRights).
4. İnsan tarafından yapılmış doğrulamanın gerçek tarihi (verifiedAt).
5. verificationStatus değerinin doğrulandı olması.
6. Sınıf, ders, ünite ve öğrenme çıktısı bilgilerinin ilgili resmî programla karşılaştırılması.
7. Gerekiyorsa eğitim-öğretim yılı, program sürümü ve lisans bilgilerinin belirtilmesi.

Bir dosyanın internette bulunması veya HTTPS bağlantısına sahip olması, yeniden dağıtım izni bulunduğunu göstermez. Kullanım hakkı doğrulanamıyorsa dosyayı depoya ekleme; yalnızca kaynağa bağlantı vermenin de uygun olduğundan emin ol. Emin değilsen materyali yayımlama ve karar için proje sahibine bırak.

- İçerik, kaynak adı, kazanım kodu, lisans veya URL uydurma.
- Örnek/yer tutucu kayıtları gerçek katalog verisi olarak ekleme.
- updatedAt ile verifiedAt alanlarını birbirinin yerine kullanma.
- Yerel URL ekliyorsan dosyayı depoya ekle ve doğrulama betiğinin geçtiğini kontrol et.

## Yerel kontrol

Node.js 22 ile:

    node --check app.js
    node scripts/validate-site.mjs

Bu kontroller kaynakların internette erişilebilirliğini, telif hakkı durumunu, ekran okuyucudaki davranışı veya gerçek cihaz görünümünü kanıtlamaz. Bunlar ayrıca kontrol edilmelidir.
