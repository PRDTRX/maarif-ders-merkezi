# PDF Çalışma Kâğıtları

Sitede kullanılacak PDF dosyalarını bu klasörün altındaki sınıf ve ders klasörlerine yerleştirin.

## 5. sınıf yükleme alanları

5. sınıf için hazır klasörler: [5. sınıf çalışma kâğıdı klasörleri](5-sinif/README.md).

- Zorunlu dersler ve seçmeli dersler ayrı tutulur.
- Seçmeli dersler, resmî çizelgede 5. sınıf için seçilebilen dersleri gösterir; her öğrencinin bu derslerin tamamını aldığı anlamına gelmez.
- PDF'yi doğru ders klasörüne yükleyin. Klasörler .gitkeep dosyalarıyla oluşturulmuştur; bu dosyaları silmeniz gerekmez.
- data.js içindeki f alanı PDF'nin depodaki göreli yoluyla aynı olmalıdır. Örnek: pdf/5-sinif/zorunlu-dersler/turkce/ornek.pdf.

## Dosya adlandırma kuralı

Önerilen kalıp:

sinif-ders-tema-veya-unite-numarasi-adi-kazanim-kodu-konu.pdf

Belgede tema varsa tema-01, ünite varsa unite-01 kullanın; programda bulunmayan tema, ünite veya kazanım kodu uydurmayın.

- Küçük Latin harfleri ve rakamlar kullanın; Türkçe karakterleri ASCII karşılıklarına dönüştürün (ş → s, ı → i, ü → u, ö → o, ç → c, ğ → g).
- Kelimeleri kısa çizgi (-) ile ayırın; boşluk veya alt çizgi kullanmayın.
- Dosya uzantısı .pdf olsun.

### Örnek

Belge: 5. sınıf Türkçe, 1. Tema: Oyun Dünyası, öğrenme çıktısı kodu T.D.5.4, “Duyduğun Sözcüğün Anlamını Tahmin Et”.

Dosya adı:

5-turkce-tema-01-oyun-dunyasi-td54-sozcuk-anlami-tahmin-et-dinleme.pdf

Göreli yol:

pdf/5-sinif/zorunlu-dersler/turkce/5-turkce-tema-01-oyun-dunyasi-td54-sozcuk-anlami-tahmin-et-dinleme.pdf

Dosyanın adını değiştirmek tek başına sitede kaynak kaydı oluşturmaz. PDF'nin görünmesi için ayrıca data.js içine uygun sınıf, ders, tema/ünite, kazanım, başlık ve f yolu bilgileri eklenmelidir.

## Resmî kaynaklar

- [MEB Talim ve Terbiye Kurulu – Öğretim Programları](https://mufredat.meb.gov.tr/Programlar.aspx)
- [MEB Talim ve Terbiye Kurulu – İlköğretim Kurumları Haftalık Ders Çizelgesi (09.05.2025)](https://ttkb.meb.gov.tr/meb_iys_dosyalar/2025_05/16094742_4nolukararilkogretimkurumlariilkokulveortaokulhaftalikderscizelgesi.pdf)
