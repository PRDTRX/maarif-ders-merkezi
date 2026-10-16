# İçerik ekleme yönergesi

Bu proje içerik arşivini daha sonra doldurmak üzere tasarlanmıştır. Siteye yeni bir öğretmen kaynağı eklemek için kaynak dosyası ve katalog kaydı birlikte güncellenir.

## 1. Dosyayı yerleştirin

Dosyayı content/ altında ilgili klasöre koyun. Önerilen klasörler: olcme-degerlendirme/, etkinlikler/, egilimler/, erdem-deger-eylem/, sosyal-duygusal-beceriler/, farklilastirma/ ve planlama-raporlama/.

Dosya isimlerinde küçük harf, rakam ve tire kullanmak bağlantı sorunlarını azaltır. Öğrenci adı, numarası, fotoğrafı veya başka kişisel veri içeren dosyaları yayımlamayın.

## 2. Kataloğa kayıt ekleyin

data/catalog.json dosyasındaki resources dizisine yeni bir nesne ekleyin. Aşağıdaki kayıt sadece alanları gösteren bir yer tutucudur; gerçek bir kaynak veya ölçme aracı değildir.

    {
      "id": "kaynak-basligi",
      "title": "Kaynağın görünen başlığı",
      "summary": "Öğretmenin kaynağın amacını ve kullanım alanını anlayacağı kısa açıklama.",
      "categoryId": "olcme-degerlendirme",
      "type": "rubrik",
      "grades": ["ortaokul"],
      "subjects": ["Fen Bilimleri"],
      "format": "PDF",
      "tags": ["rubrik", "öğrenme kanıtı"],
      "file": "content/olcme-degerlendirme/kaynak-basligi.pdf",
      "sourceType": "original",
      "sourceUrl": "",
      "updatedAt": "2026-10-16",
      "status": "published"
    }

templates/resource.schema.json, kayıtların beklenen alanlarını ve kabul edilen değerleri tarif eder. Yeni kategori eklenirse `data/catalog.json` içindeki kategori listesi ve `templates/resource.schema.json` içindeki `categoryId` değerleri güncellenmelidir. Ana sayfadaki alan şeridi (`index.html` içindeki `data-jump-category` bağlantıları) elle yazıldığı için, şeritte görünmesini istediğin kategoriyi oraya da ekle; başlığı katalogdaki `title` ile aynı yaz.

### Alanlar

- id: benzersiz, küçük harfli kimlik.
- title ve summary: arama sonuçlarında görünen başlık ve kısa açıklama.
- categoryId: data/catalog.json içindeki kategori kimliklerinden biri.
- type: araç türü filtresinin anahtarı.
- grades: kaynakla uyumlu düzeyler. Birden fazla düzey seçilebilir.
- subjects: ders adları. Genel kaynaklarda boş dizi kullanılabilir.
- format: dosya türü.
- tags: arama için konu etiketleri ve eş anlamlı sözcükler.
- file: content/ altında göreli dosya yolu. Dış kaynakta boş bırakılıp sourceType external ve sourceUrl doldurulabilir.
- sourceType: official (resmî), adapted (uyarlanmış), original (özgün) veya external (haricî kaynak).
- updatedAt: ISO biçiminde tarih (YYYY-MM-DD).
- status: hazırlıkta draft, sitede yayımlamak için published, kaldırmak için archived.

## 3. Yerel kontrol

Proje kökünde şu komutu çalıştırın:

    python -m http.server 8000

http://localhost:8000 adresini açın. Arama, kategori, tür, sınıf düzeyi ve ders filtrelerini kontrol edin. JSON dosyasındaki yazım hataları katalog yüklenmesini engelleyebilir.

## 4. İçerik kalitesi

1. Önce güncel öğretim programı ve MEB'in ilgili kılavuzuyla uyumu kontrol edin.
2. Kaynağın özgün, uyarlanmış veya resmî olduğunu doğru belirtin; telif ve kullanım koşullarına uyun.
3. Eğilim, değer ve sosyal-duygusal beceriler için kişilik yargısı yerine bağlam içinde gözlenebilir göstergeler tercih edin.
4. Değerlendirme ölçütlerini, gözlem koşullarını ve geri bildirim amacını anlaşılır yazın. Tek bir kanıta dayanarak kalıcı kişilik çıkarımları yapmayın.
5. Yaş düzeyine, öğrenme ihtiyaçlarına ve erişilebilirliğe uygunluğu kontrol edin.
6. Öğrenciye veya aileye ait kişisel verileri kamuya açık depoya koymayın.
