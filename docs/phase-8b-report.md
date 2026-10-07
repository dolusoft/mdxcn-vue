# Faz 8B — GraphBars ve GraphSpark

Başlangıç `main`, `bdd7d9d`; çalışma ağacı temizdi. Upstream checkout komutla
`16d817ad5ec54d89142e4c1cf26027b60d6df853` olarak doğrulandı. Sistemden alınan
zaman: 2026-10-07 Çarşamba 03:52 (Europe/Istanbul).

## Okuyucu kararı ve uygulama

Upstream `seriesOf` okuyucusu Spark, Plot ve KPI tarafından paylaşılır. Core
`series.ts` dosyasındaki tek `seriesOf` işlevi, framework bağımsız liste metni
veya source metni alır; değerler, hizalı etiketler ve caption üretir. Vue ve
Markdown adapter'ları bu işlevi kullanır. Sonraki teslimat aynı okuyucuyu
kullanabilir; `GraphPlot` ve `GraphKpi` uygulamalarına dokunulmadı.

Bars farklı grammar kullanır: her listede birden fazla sayı vardır. Core
`barsFromList` bu ayrımı korur; Spark'ın tek değer okuyucusuna zorlanmaz.
Tipli `BarSeries`, `SeriesProps`, `SeriesData`, bileşen props ve `Series`
marker adaptörü eklendi. Markdown compiler, Bars için `series`, Spark için
`written` taşınabilir modellerini üretir. Bu alanlar, bağımsız `from`/`to`
ve `data`/`caption` önceliklerini korur. Public/core export listeleri, iki docs
sayfası/sidebar, ESLint `Series` istisnası ve registry/tüketici yolları eklendi.

- Bars: boş olmayan Markdown liste → `Series`; `from` ve `to` prop alanları
  birbirinden bağımsız kazanır, sonra seri 0 ve seri 1 kullanılır. Açık boş
  değer dizileri kazanır. Kalın alt düğüm de sekiz satırlık `lg` boyutunu seçer.
  İki taraf ayrı ölçeklenir. Sıfır alt hücreyi doldurur; negatif değer boş kolon
  bırakabilir. Sayı dizisindeki `NaN` bütün kolonları boş bırakır.
- Spark: `data` → yazılı seri; otomatik caption yalnız `data == null` iken
  gelir. Açık caption bağımsız kazanır; boş string caption'ı bastırır.
  Boş olmayan liste, bütün satırları geçersiz olsa bile raw metinden önce gelir.
  Liste değerleri `numberOf` ile okunur; geçersiz satırlar ve karşılık gelen
  etiketler birlikte elenir. Raw metinde run token'ları açılır, geçersiz sayılar
  elenir; source caption kalın/italik işaretlerini upstream gibi korur.
- Ölçek `Math.max(...values, 1)` davranışını korur. Spark negatif ve sıfır
  değerlerde ilk glifi, eşit pozitif değerlerde son glifi kullanır. Dizideki
  `NaN` korunur ve bütün noktalarda ilk glif seçilir; string girdide elenir.
- Runtime liste, source ve `Series` gövdesi yollarında VitePress `header-anchor`
  bağlantıları atılır. Fragment açılır, custom Vue component opak kalır.
  VNode klonlanmaz veya değiştirilmez; kaynak taraması ve kimlik testi vardır.

## Brifingde ve çalışırken düzeltilenler

Brifingdeki eksen/min-max etiketleri bu iki upstream bileşende bulunmuyor.
Bars ayrıca ekran okuyucu özeti içermez; yalnız oklar dekoratiftir. Spark
track dekoratiftir, ayrı `sr-only` metni nokta sayısını ve caption'ı verir.
Yeni etiket/özet uydurulmadı; upstream DOM, class ve a11y sözleşmesi korundu.
Bu bileşenler sayısal display biçimlendirmesi yapmaz; locale bağımlı sayı
biçimlendirmesi eklenmedi. Ortak `formatNumber` işlevinin sabit `en-US`
davranışı değiştirilmedi.

Faz 8A raporundaki 863 başlangıç sayısı güncel değil. `git show bdd7d9d`
ile doğrulanan iki Vue ve bir Markdown testi başlangıcı **866** yapar.
Son toplamdan yeni testler çıkarılınca da aynı sayı bulunur.

İlk yeni test çalışmasındaki selector Spark track yerine köşe glifini
seçiyordu; selector düzeltildi. Test helper ve JSON fixture prop tipleri Vue
test araçlarının overload sözleşmesine uyarlandı; SFC tipleri gevşetilmedi.
Yeni dosyalardaki Prettier farkları giderildi ve registry yeniden üretildi.

İlk typecheck ile `consumer:check` aynı anda çalıştırılmıştı. Tüketici betiğinin
yeniden build sırasında declaration dosyalarını kaldırması docs typecheck
için geçici `TS7016` üretti. Kontroller sıralı yeniden çalıştırıldı; son kabul
zincirinin bütün komutları çıkış 0 verdi. Kodda declaration workaround yoktur.

## Doğrulama

Beş upstream örneği yerel `components/docs/examples.tsx` dosyasından bağımsız
fixture'lara aktarıldı; modeller ve beklenen glifler okuyucu çıktısından
üretilmedi. İki Bars ve bir yazılı Spark örneği gerçek VitePress compiler
yolunu uyarısız kullanır; diğer iki Spark örneği upstream gibi doğrudan veri
prop girdisidir. Beş örnekte model/data DOM eşitliği, görünür SSR, attrs
aktarımı ve uyarısız hydration sınandı. Üç yazılı örnek ile dört ek kenar
fixture production VitePress içinde compiler/runtime/data DOM eşitliği
sağlar. Runtime fixture'larını zorlayan null props için fallback uyarıları
beklenir.

Boş, tek, eşit, sıfır, negatif, `NaN`, invalid string, karışık etiket,
emphasis, loose/nested liste, run, custom glyph/palette, marker normalize,
reactive slot/prop ve permalink yolları sınandı. Her iki bileşende 60 noktanın
directive binding gecikmesi **240 ms** tavanında kalır; ayrıca `2*9999`
girdisinin upstream grammar ile 5000 noktaya sınırlanıp tamamının görünür SSR
üretmesi doğrulandı.

`SeriesTypes.vue` negatif kontrolünde geçici `size="huge"` ve `:data="['bad']"`
girdileri kök typecheck tarafından reddedildi:

```text
test/fixtures/SeriesTypes.vue(11,41): error TS2322: Type '"huge"' is not assignable to type '"sm" | "lg" | undefined'.
test/fixtures/SeriesTypes.vue(14,52): error TS2322: Type 'string' is not assignable to type 'number'.
NEGATIVE_EXIT=1
```

Fixture özgün byte içeriğine `finally` ile geri yüklendi; sonraki typecheck
geçti. Kanıt `C:/Users/zahid/source/github/tmp/mdxcn-vue/f8b-negative.log`.

Tam kabul zinciri sıralı çalıştırıldı:

```sh
pnpm install && pnpm -r build && pnpm -r test && pnpm lint && pnpm typecheck && pnpm format:check && pnpm consumer:check
```

| Kontrol | Çıktı |
| --- | --- |
| Install | `Already up to date`; lockfile değişmedi |
| Build | Vue, Markdown ve VitePress client/server/statik sayfa build başarılı |
| Test | Vue **559 passed**, Markdown **300 passed**, docs **64 pass**; toplam **923** |
| Yeni test | **57**: Vue 36, Markdown 19, docs 2; başlangıç 866 |
| Lint/typecheck | ESLint ve üç workspace çıkış 0 |
| Format | `All matched files use Prettier code style!` |
| Registry build/check | `40 items from library sources` |
| Registry CLI/kurulum | `40 items, 84 source files; typecheck and build passed`; gerçek CLI payload eşitliği |
| Tüketici | `CONSUMER CHECK PASSED`; kayıtlı VitePress tüketicisinde 36 figure |
| Paket tipleri | Bundler/NodeNext, `skipLibCheck=false`; yanlış `size` ve string sayı dizisi reddedildi |
| Tree shaking | Tek Vue runtime; full 273967 byte, GraphStack 168467 byte |
| Yalnız kütüphane | Vue hariç full 100459 byte, GraphStack 14461 byte |

Tam log `C:/Users/zahid/source/github/tmp/mdxcn-vue/f8b-acceptance.log`;
ölçümler aynı dizindeki `consumer-results.json` dosyasında. Son kabulde
başarısız veya atlanan test yoktur. Export snapshot genişletildi; tüketici
figure sayısı 34 → 36, registry öğe sayısı 38 → 40 oldu. Önceki test
beklentileri gevşetilmedi.

## Bilinçli farklar ve kalan canlı ölçümler

Motion yerine ortak `vReveal` kullanılır: 30 ms artış, toplam 240 ms tavan;
Bars grupları 40/160 ms ile başlar. Upstream `fillDelay` artışı 280 ms ile
sınırlayıp Bars grup gecikmesini ayrıca ekler. Vue SSR görünürdür; Spark mono
soluk noktalarda `0.4` opacity SSR ve hydration öncesinde de korunur. Ortak
Vue figure/caption ilişkilendirmesi ve reduced motion directive davranışı
korundu. `series`/`written` props compiler'ın taşınabilir model yüzeyidir.

Dev sunucusu, canlı tarayıcı/E2E oturumu ve npm yayını yapılmadı. Tarayıcıda
dar ekranda Bars grup/ok dönüşü, uzun seri yatay taşması, Spark glif fontları,
light/dark palette kontrastı, ekran okuyucu metni, JS kapalı/reduced motion,
CLS ve observer/WAAPI gecikmesi ölçülecek. Otomatik testler bu ölçümlerin
yerine geçmez.

Teslimat açık izinle imzasız commit ve hemen normal push kullanır; hook bypass
ve kalıcı git config değişikliği yoktur. Commit kimliği, temiz çalışma ağacı
ve `origin/main` eşitliği son mesajdan önce komutla doğrulanır.
