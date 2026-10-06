# Faz 5A — Steps, Changelog, Decision

Başlangıç `main`, `ed6a8f3`; çalışma ağacı temizdi. Yerel salt okunur upstream
checkout `16d817ad5ec54d89142e4c1cf26027b60d6df853`, envanterdeki kaynakla eşleşti.
Üç bileşen, `graph-markdown`/`graph-frame` yardımcıları ve altı docs örneği
kaynak dosyalardan doğrulandı. Dev sunucusu, npm yayını ve tarayıcı oturumu yoktur.

## Yapılanlar ve düzeltilen varsayımlar

- `Steps`/`Step`: loose paragraph başlık/gövde ayrımı, tight listelerde em dash,
  `strong` → `now`, `em` → `next`, varsayılan `done`, sayı genişliği ve bağlayıcılar.
  Zengin paragraph ve item gövdeleri korunur; başlık düz metindir.
- `Changelog`/`Change`: tür alias'ları, düz metin liste gövdeleri, zengin item
  gövdeleri, `title ?? version`, koşullu metadata satırı ve palette rolleri.
- `Decision`: tipli `options`, boş dizinin üstünlüğü, `null`/`undefined` fallback,
  liste dışındaki elementlerin her durumda çizilmesi, nedenler ve ilk seçimin
  screen-reader özeti. `strong` işareti `em` işaretinden önceliklidir.
- Markdown token → tipli model yolu, public export snapshot, gerçek Vue şablon
  tip fixture'ı, üç docs sayfası/sidebar, registry kaynakları ve tarball/CLI
  tüketicisi güncellendi. Yeni bileşen adları ESLint ignore listesine eklendi.
- Brifingdeki genel “props/item” ifadesi upstream API sayılmadı: `Steps` ve
  `Changelog` veri dizisi desteklemez; `Decision` item API sunmaz. `list` ve
  `after` yalnız derleyici girişleridir ve belgelerde böyle tanımlanır.
- Envanterde yalnız sıralı liste yazan `Steps` satırı düzeltildi: gerçek
  `listItems` okuyucusu hem `ol` hem `ul`, list host yokken doğrudan `li` kabul eder.
- Tight listelerde `hidden` paragraph token'ları host `p` sayılmadı; böylece
  derleyici, runtime ile aynı başlık/gövde ayrımını üretir. Boş inline text
  token'ları yeni paragraph modellerinden çıkarıldı.
- Yeni bileşenlerin boş satırsız sıralı listeleri yanlışlıkla derlemesi önlendi;
  üç regresyon testi konumlu fallback uyarısını doğrular.
- İlk tüketici denemesi, yeni fixture'ın em dash karakteri Windows dosya
  yazımında bozulduğu için kırmızıydı. UTF-8 metin düzeltildi; tüketici tekrar
  çalıştırıldı ve geçti. Sonuç JSON'undaki figure sayısı da 11 olarak güncellendi.
  Yeni observer testlerinin TypeScript mock türleri düzeltildi; son typecheck yeşildir.

## Ortak okuyucu kararı

Upstream ortaklığı liste seçimindedir: `listItems`, `itemText`, `hasHost` ve
paragraph seçimi. Mevcut `readerListItems` yeniden kullanılır; yeni dahili
`adapters/state-list.ts`, Fragment açma, host durum taraması ve normalize edilmiş
öğe açıklamasını bir yerde üretir. `core/state-list.ts` Vue bağımsız tipleri ve
üç ayrı `stepFromList`, `changeFromList`, `optionFromList` grammar işlevini içerir.
Markdown token adaptörü aynı açıklamayı üretir; durum grammar'ı kopyalanmaz.

Sonraki teslimatların kaynakları da aynı `listItems` yardımcılarını kullanır;
ancak `Chat` konuşmacı prefix'i ve `itemParts`/`dropLead`, `Keys` kısayol
grammar'ı, `GraphTimeline` tarih/başlık/gövde, `GraphSpec` alan/zengin değer
ayrımı ister. Özellikle Timeline/Spec durum işaretlerini yalnız `head` içinde
arar; bu teslimat bütün item içinde arar. Bu nedenle evrensel durum grammar'ı
zorlanmadı. Ortak liste/host yardımcıları yeniden kullanılabilir; sonraki
bileşenlerin grammar'ları bu teslimatta uygulanmadı veya değiştirilmedi.

## Kabul çıktısı

Tam zincir, her adım başarısızsa duran komut akışında sıfır çıkış koduyla geçti:

```sh
pnpm install && pnpm -r build && pnpm -r test && pnpm lint && pnpm typecheck && pnpm format:check && pnpm consumer:check
```

| Kontrol | Çıktı / sonuç |
| --- | --- |
| `pnpm install` | `Already up to date` |
| `pnpm -r build` | İki paket, VitePress client/server ve statik render geçti |
| `pnpm -r test` | Vue 237, Markdown 136, docs 31; toplam 404 geçti, atlanan test yok |
| `pnpm lint` | `eslint .`, çıkış 0 |
| `pnpm typecheck` | Üç workspace, çıkış 0 |
| `pnpm format:check` | `All matched files use Prettier code style!` |
| `pnpm consumer:check` | `CONSUMER CHECK PASSED` |
| Registry CLI | `15 items, 38 source files; typecheck and build passed` |
| Kayıtlı tarball host'u | `11 figures`; yeni üç bileşen çizildi, Footnotes fallback korundu |
| Paket tipleri | Bundler/NodeNext, `skipLibCheck=false`; yanlış prop/state türleri reddedildi |
| Tree shaking | Tek Vue runtime; full 199552 byte, GraphStack 166363 byte |
| Yalnız kütüphane | Source-map ölçümü, Vue hariç: full 39719 byte, GraphStack 12515 byte |

Başlangıç 347 testti: **57 yeni test** (Vue 32, Markdown 19, docs 6).
Tam çıktı `C:/Users/zahid/source/github/tmp/mdxcn-vue/f5a-acceptance.log`, tüketici
ölçümleri aynı dizindeki `consumer-results.json` dosyasındadır.

Elle yazılan bağımsız beklentiler önce upstream install/runbook/release/database
örneklerinin değerlerini, sınıflarını ve ARIA yapısını doğrular. Ardından gerçek
production fixture'ındaki 11 figure için Markdown, host, item veya veri yolları
karşılaştırılır. Yalnız Vue yorum düğümleri ve caption kimlikleri normalize edilir;
kimlik benzersizliği ve figure/caption ilişkisi ayrıca sınanır.

## Bilinçli farklar ve sınırlar

React Motion yerine mevcut `vReveal` kullanılır; SSR görünürdür. `Steps` 60 ms
artış ve 300 ms tavan, diğer listeler 50 ms artış ve 250 ms tavan kullanır.
60 satırlık listelerde son satırın tek başına görünmesi observer/WAAPI mock ile
doğrulandı. Hydration jsdom'da `IntersectionObserver` olmadan DOM eşitliğini ve
mismatch uyarısı yokluğunu ölçer; gerçek tarayıcı ölçümü değildir.

VNode adaptörü Fragment açar, özel Vue kapsayıcılarını opak tutar. Ham HTML,
iç içe listeler, item etiketleri, dinamik Vue ve açık veri props konumlu uyarıyla
runtime yolunda kalır. Derleyici yalnız desteklenen liste/paragraph yapısını
derler. Upstream `Changelog` mobile tür etiketini gizler ve `Decision` yalnız
ilk chosen seçeneği özetler; bu davranışlar korunur. Mevcut Graph caption/ARIA
iyileştirmeleri kullanılır; React DOM'unun birebir yeniden çalıştırıldığı iddia edilmez.

Kapsam dışı bulgu: `vue-tsc --listFiles`, önceki `TerminalTypes.vue` fixture'ını
mevcut include/import akışında göstermedi. Eski fixture'lar değiştirilmedi.
Yeni `StateListTypes.vue` test modülünden doğrudan içe alınır; `--listFiles`
çıktısında bulunduğu ve yanlış tür beklentilerinin yeşil olduğu doğrulandı.
Önceki 960–1279 px nav kayması ve CLI transitive dependency uyarıları değiştirilmedi.

## Git teslimatı ve tarayıcıda ölçülecekler

Bu teslimat tek imzasız uygulama commit'iyle, hook atlamadan, ardından normal
push ile tamamlanır. Son commit kimliği, temiz çalışma ağacı ve `origin/main`
eşitliği commit sonrası teslimat mesajında bildirilir.

`/components/steps`, `/components/changelog`, `/components/decision`: light/dark,
mobil tür/neden yerleşimi, uzun başlık ve metin satır kırılması, font fallback,
klavye/link odakları, ekran okuyucu listeleri ve seçimin özeti, JS kapalı
görünürlük, reduced motion, CLS ve uzun listede gerçek observer/WAAPI gecikmesi.
Bu teslimatta tarayıcı/E2E oturumu çalıştırılmadı.
