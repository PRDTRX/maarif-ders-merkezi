# Güvenlik politikası

Maarif Ders Merkezi, kişisel hesap veya sunucu tarafı veri deposu bulunmayan statik bir sitedir. Buna rağmen kullanıcı arayüzü kodu, katalog girdileri, dış bağlantılar ve iş akışı yapılandırması güvenli varsayılamaz.

## Güvenlik açığı bildirimi

Hassas bir güvenlik sorunu bulduysan ayrıntıları herkese açık bir issue veya pull request içinde yayımlama. Depoda GitHub Private vulnerability reporting etkinse onu kullan; değilse depo sahibine GitHub üzerinden özel bir ileti göndererek etkilenen dosyayı, olası etkiyi ve tekrar üretme adımlarını bildir.

## Güvenlik kuralları

- Katalog verisini HTML olarak enjekte etme; güvenli DOM API'leri kullan.
- Kullanıcıya açılan kaynak bağlantıları HTTPS olmalı ve URL kimlik bilgisi içermemeli.
- Yeni sekmede açılan bağlantılar noopener ve noreferrer ile yalıtılmalı.
- Materyal URL'leri ve asıl kaynak URL'leri doğrulanmalı; yerel dosyaların depoda gerçekten bulunduğu kontrol edilmeli.
- Katalog girdileri güvenilir kaynak, insan doğrulaması ve açık kullanım koşulları olmadan yayımlanmamalı.
- GitHub Actions için gereken en düşük izinleri kullan; sır veya erişim anahtarlarını depoya koyma.
- GitHub Pages üzerinden sunulan güvenlik başlıklarını canlı yanıtta ayrıca denetle.

## Kapsam sınırı

Statik doğrulama betiği, gerçek tarayıcı güvenlik testinin, dış kaynak taramasının veya hukuki kullanım hakkı doğrulamasının yerine geçmez.
