# Faz 11A — Yayın öncesi temizlik

Başlangıç `main`, `33c90b4`; çalışma ağacı temizdi. Sistem zamanı:
2026-10-07 Çarşamba 05:31 (Europe/Istanbul).

## Kök giriş noktasının tree-shaking davranışı

Brifingdeki 135.831 bayt eşitliği yeniden üretilemedi. Aynı koşullardaki yeni
ölçümde iki bileşen zaten farklı boyuttaydı; ancak kullanılmayan item kayıtları
ve frame yardımcıları bundle içinde kalıyordu. `sideEffects: ["**/*.css"]`
zaten vardı; CSS kök JavaScript girişinden yüklenmiyordu. `graphComponents` ve
knap fabrika çağrıları zaten `@__PURE__` işareti taşıyordu.

Eksik işaretler bileşenlerin `defineComponent`, item işaretçilerinin `defineItem`
ve frame yardımcılarının `host` çağrılarındaydı. Bu çağrılar yalnız döndürdükleri
nesneyi oluşturur. `defineItem` yalnız yeni nesnenin şemasını `WeakMap` içine
yazar; kullanılmayan nesnenin kaydını atmak kullanılan nesnelerin kaydını etkilemez.
Public API, kayıt yapısı ve CSS sözleşmesi korunarak bu çağrılar işaretlendi.
Registry kaynak çıktıları yeniden üretildi.

`scripts/tree-shaking-check.mjs`, aynı Vue runtime ve `minify=false` ile Vite
8.3.3/Rolldown production build çalıştırır. Tek girişin export değeri global
bir alana atanır; böylece import tamamen atılamaz. “Tümü” kök export kümesinin
tamamını canlı tutar. HTML, mount ve CSS bu ölçümde yoktur; Vue dahildir.

| Kök import | Önce (bayt) | Sonra (bayt) |
| --- | ---: | ---: |
| Tüm export değerleri | 258214 | 258774 |
| `GraphStack` | 74893 | 51045 |
| `Footnotes` | 69472 | 45333 |

Tek bileşen/tüm export oranı ve `GraphStack` bundle içindeki ilgisiz
Footnotes/knap/Comark ile item/frame sembollerinin yokluğu otomatik sınanır.
Kontrol `consumer:check` içine bağlandı; paketlenmiş tarball tüketicisinde de
tek bileşen boyutu ve `Footnotes` için ayrı build sınanır.

İlk doğrulama: Vue paketinde **900 test geçti**; tarball tüketici kontrolü
**52 registry öğesi / 111 kaynak dosyası** ile geçti. Mount içeren tüketicide
`minify=false`: tüm kullanılan bileşenler 300122, `GraphStack` 166498,
`Footnotes` 160604 bayt. Bunlar yukarıdaki global export ölçümünden farklı
girişlerdir; iki ölçüm birbirinin önce/sonra değeri olarak kullanılmaz.

## Doküman iddialarının doğrulanması

Upstream checkout `16d817ad5ec54d89142e4c1cf26027b60d6df853` komutla doğrulandı.
Activity kaynak dosyasındaki işlevler TypeScript ile derlenip çalıştırıldı:
`days=[{date:'+275760-09-13',count:1}]`, `weekStartsOn=1` gerçekten
`RangeError: Invalid time value` üretiyor. Brifingdeki `toISO(last)` kaynakta
yoktur; hata döngüdeki `toISO(time)` çağrısındadır. Portun derlenmiş `parseUTC`
işlevi aynı tarihi reddediyor; `buildWeeks` sonucu `[]`. Faz 9B raporu düzeltildi.

Knap için `graph_meter({value:'oops'})` uyarısız `NaN%`,
`graph_spec({rows:[{label:'x'},{label:'y',value:{x:1}}]})` uyarısız `undefined`
ve `[object Object]` üretti. Doküman yalnız okuma hatası veya throw durumunda
uyarı verildiğini söylüyor; şema doğrulaması iddiası kaldırıldı. Güvenilmeyen
filtre girdisi ve daha uzun ASCII fence davranışı açıklandı.

Comark 0.7.0 ile çalıştırılan gerçek parse çıktısı, `body` içindeki tek başına
`::` satırından sonraki metnin blok dışında kaldığını, inline `::` ifadesinin
blok içinde kaldığını gösterdi. `coerceProps` string `once`, `only`, `onclick`
alanlarını attı. Dokümandaki `security()` eklentisi örneği çalıştırıldı;
`javascript:` URL ve inline handler kaldırıldı.

Footnotes bilgisi ayrı bir sayfada değil `apps/docs/docs/mdx.md` içindedir;
not oraya eklendi. Production HTML içinde iki backlink yalnız `↩︎` glifi
taşıyor ve `aria-label` yok. Host bağlantılarını ve dilini değiştirmemek için
bu kapsamda yeni bir label eklenmedi; açıklayıcı erişilebilir ad eksikliği
upstream ile ortak, bilinçli korunan bir sınırlama olarak belgelendi.

Docs production build geçti. Kanıtlar yetkili scratch dizinindeki
`f11a-docs-evidence.mjs`, `f11a-docs-evidence.log`, `f11a-docs-build.log`
dosyalarındadır. Son kabul zinciri ve mutant kanıtları aşağıya eklenecektir.
