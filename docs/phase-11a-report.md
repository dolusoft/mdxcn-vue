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

İlk doğrulama: Vue paketinde **900 test geçti**. Son kabul zinciri ve diğer
iki bölümün kanıtları aşağıya eklenecektir.
