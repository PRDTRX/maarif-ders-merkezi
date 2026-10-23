# Katkı ve içerik kontrolü

Bu proje derleme adımı gerektirmeyen statik HTML, CSS ve JavaScript kullanır. Harici bağımlılık eklemeden önce gerekçesini ve bakım maliyetini değerlendirin.

## Yerel kalite kontrolü

Node.js 20 veya üstü ile:

```sh
node --check app.js
node --check data.js
node --test tests/*.test.cjs
```

## Etkinlik kaydı ekleme

- Her kayda kalıcı ve benzersiz bir `id` verin. Var olan kimlikleri yeniden kullanmayın.
- `g` pozitif tam sayı; `m` pozitif süre olmalıdır.
- `dt` kullanılıyorsa gerçek bir takvim tarihi olan `YYYY-MM-DD` biçiminde yazılmalıdır.
- `f` boş bırakılabilir. Doldurulursa `pdf/dosya-adi.pdf` biçiminde bir göreli yol veya HTTPS üzerinden doğrudan PDF bağlantısı kullanın.
- `dl` ve `fv` alanlarını yalnızca ölçülmüş, doğrulanabilir değerler mevcutsa kullanın.
- Kazanım kodlarını, metinlerini ve ders/ünite eşleşmelerini yayın öncesinde ilgili resmî programla karşılaştırın. Otomatik testler bu editoryal doğrulamayı yapamaz.
- Gerçek PDF dosyasının depoda bulunduğunu ve tarayıcıda açıldığını yayın öncesinde doğrulayın.

Pull request'ler statik kalite iş akışından geçmelidir. Tarayıcı davranışları için manuel kontrol de gereklidir.
