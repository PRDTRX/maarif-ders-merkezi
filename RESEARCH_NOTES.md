# Araştırma notları ve ürün kararları

Bu notlar başlangıç mimarisinin hangi resmî başvuru noktalarından ve tasarım varsayımlarından hareketle oluşturulduğunu kaydeder. Bu repo MEB'in resmî ürünü değildir.

## 1. Öğrenme Kanıtları (Ölçme ve Değerlendirme)

Kaynak: https://tymm.meb.gov.tr/olcme-degerlendirme

MEB sayfası; ölçme-değerlendirmenin öğretim sürecinin parçası olarak ele alınmasını, gelişimin izlenmesini, öğrenciye geri bildirim verilmesini ve farklı öğrenme kanıtlarının kullanılmasını anlatır. Portfolyo, performans görevi, sunum, kontrol listesi, gözlem/görüşme formu, anket, rol oynama, öz/akran/grup değerlendirmesi ve yansıtma yazısı gibi örnekler yer alır.

Ürün kararına etkisi: Birden fazla araç türü aynı kütüphanede tutulur. Kayıtlarda kategori, araç türü, sınıf düzeyi, ders, format ve etiket metadata alanları bulunur. Arayüz, belge adının yanında kaynağın amacını anlatan kısa açıklamayı da gösterir.

## 2. Program Okuryazarlığı Kılavuzları

Kaynak: https://tymm.meb.gov.tr/program-okuryazarligi-kilavuzlari

Resmî portalda sosyal-duygusal öğrenme, Erdem-Değer-Eylem, öğrenme kanıtları/ölçme-değerlendirme ve farklılaştırma gibi ayrı kılavuz başlıkları bulunur.

Ürün kararına etkisi: Bu konular ayrı içerik kategorileri olur; kullanıcılar materyalleri ortak arama ve filtreleme üzerinden keşfedebilir.

## 3. Eğilimler

Kaynak: https://tymm.meb.gov.tr/beceriler/egilimler

Bu sayfa eğilimleri modelin diğer bileşenleri ve becerileriyle ilişkili bir çerçevede ele alır.

Ürün kararına etkisi: Eğilimler ayrı bir kategori olarak yer alır; ileride eklenecek materyallerin bağlamı ve gözlenebilir göstergeleri açıklamalarında belirtilebilir. Site, eğilimleri kişilik etiketi veya bağlamdan kopuk bir puana indirgemeyi teşvik etmez.

## 4. Öğretmen görüşlerine dayalı izleme ve değerlendirme raporları

Kaynak: https://ttkb.meb.gov.tr/www/ogretmen-goruslerine-dayali-olarak-hazirlanan-turkiye-yuzyili-maarif-modeli-izleme-ve-degerlendirme-raporlari-tamamlandi/icerik/907/tr

Talim ve Terbiye Kurulu Başkanlığının 30 Haziran 2026 tarihli duyurusu, 2025-2026 döneminde öğretmen görüşlerinden hareketle hazırlanan raporların 17 ders alanını kapsadığını bildiriyor. Duyuru sayfası raporların tamamındaki bulguları ayrıntılı vermediği için bu not, belirli bir güçlüğün araştırma sonucuyla kanıtlandığını iddia etmez.

## Ürün gereksinimlerine dönüşen ilkeler

- Bulunabilirlik: Türkçe arama; kategori, araç türü, sınıf düzeyi ve ders filtreleri.
- İçeriği koddan ayırma: Dosyalar content/ içinde, katalog kayıtları data/catalog.json içinde tutulur.
- İzlenebilirlik: Kaynak türü, asıl bağlantı ve güncelleme tarihi metadata alanlarıdır.
- Dürüst kaynak sunumu: Resmî, uyarlanmış, özgün ve dış kaynak içerikleri farklı biçimde kayıtlanır.
- Değerlendirme kalitesi: Gözlenebilir göstergeler, birden fazla öğrenme kanıtı, açık ölçütler ve geri bildirim temel tasarım ilkeleridir.
- Erişilebilirlik: Mobil uyum, klavye odağı, semantik HTML ve azaltılmış hareket tercihi desteği.
- Basit dağıtım: Haricî servis veya derleme bağımlılığı olmadan GitHub Pages üzerinde yayımlanabilir.

## Bilinçli olarak kapsam dışında bırakılanlar

İlk sürümde kullanıcı hesabı, öğrenci veritabanı, otomatik not verme, öğretmenlerin özel öğrenci verilerinin saklanması veya MEB sistemleriyle entegrasyon yoktur. Bu özellikler farklı güvenlik, gizlilik, yetkilendirme ve bakım kararları gerektirir.
