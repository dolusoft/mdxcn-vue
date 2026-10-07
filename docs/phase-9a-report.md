# Faz 9A — GraphCells, GraphMeter ve GraphWaffle

Başlangıç `main`, `ae45b57`; çalışma ağacı temizdi. Upstream checkout komutla
`16d817ad5ec54d89142e4c1cf26027b60d6df853` olarak doğrulandı. Sistemden alınan
zaman: 2026-10-07 Çarşamba 04:16 (Europe/Istanbul).

## Okuyucu kararı ve doğrulanan sözleşme

`Meter` ve `Waffle`, upstream'de ortak `fraction` ve `firstToken` okuyucularını
kullanır. Core `grid-fraction.ts` içinde `fraction`/`fractionOf` ortak eklendi;
mevcut `firstToken` yeniden kullanıldı. `seriesOf` ve `kpiOf` değişmedi:
seri, KPI ve oran grammar'ları birbirinin yerine kullanılamaz. `Grid` için
`gridCellsOf`/`gridsFromList` ayrı işlevlerdir; mevcut `splitLabel` kullanılır.

Brifingdeki meter eşikleri ve waffle kategori dağılımı upstream'de yoktur.
Meter tek oranı sabit palette ile gösterir; `role="meter"` ve `aria-value*`
öznitelikleri yoktur. Waffle tek orandır; varsayılan 100 hücre/10 sütun,
özelleştirilebilir boyut ve son satırda boş padding span'ları vardır. Kategori
yüzdelerini 100'e tamamlama kuralı eklenmedi. Cells'te de `sr-only` hücre özeti
yoktur: glif ızgarası `aria-hidden`, label görünürdür. Bu davranışlar korunur.

Cells önceliği: `items` (boş dizi dahil) → boş olmayan doğrudan Markdown
liste → `Grid`. Item `cells` alanı, boş dizi dahil, gövdeye üstün gelir.
Birden fazla doğrudan element her biri ayrı satır olur; aksi halde `/`
ayıracı, ardından paragraph/newline satırları kullanılır. İç içe listenin
metni üst satıra katılmaz. Sayılar `Number` ile okunur, sonlu olmayanlar
atılır, run genişletme yoktur; yalnız tam `1` dolu hücredir.

Oranlarda `value` ilk görünür token'a üstün gelir. `caption` bağımsız kazanır,
boş string korunur; otomatik yazılı açıklama yalnız `value == null` iken
alınır. Yüzde string'i 100'e bölünür. Geçersiz string sıfır olur; sayısal
`NaN` korunur ve hiçbir hücre dolmaz. Görünür yüzde ve dolu hücre sayısı ayrı
`Math.round` işlemleridir. Negatif ve yüzde 100 üstü değerler clamp edilir.
Sıfır hücre boş ızgara üretir. Upstream gibi pozitif hücre/0 sütun girdisi
sonsuz array uzunluğu nedeniyle `RangeError` üretir; bu fark gizlenmedi.
Bu bileşenler locale biçimlendirmesi çağırmaz; yüzde integer string'idir.
Mevcut sabit `en-US` sayı biçimlendirmesi değiştirilmedi.

Tipli props, `Grid` item şeması, taşınabilir `written` oran modeli, Markdown
compiler, public/core export listeleri, docs/sidebar, registry ve tüketici
yolları tamamlandı. `ticks`, `cells`, `columns` statik numeric string'i de
kabul eder. ESLint'te upstream `Grid` adı için istisna eklendi. VNode klonlama
veya değiştirme yoktur; Fragment şeffaf, custom component opaktır. Runtime
okuyucuları VitePress `header-anchor` bağlantılarını dışlar.

## Testler ve düzeltilen beklentiler

Sekiz upstream örneği bağımsız JSON fixture ile model, glif, dolu hücre ve
erişilebilir özet beklentileri üzerinden sınandı. Runtime, model ve doğrudan
props DOM'u eşittir. Sekiz örnekte görünür SSR, attrs ve uyarısız hydration
geçti. Production VitePress fixture'ındaki 27 figure, dokuz senaryonun
compiler/runtime/doğrudan props yollarını karşılaştırır. Bunlara çoklu boşluk,
softbreak, emphasis ve iç içe liste senaryoları dahildir.

Vue'nun iki inline element arasında yalnız newline içeren metni kaldırdığı
`compile` çıktısıyla doğrulandı. Yeni aile compiler'ı bu sınırı, normal metin
içindeki softbreak condensation işleminden önce uygular. `**67%**` ve
sonraki satırdaki `*used*`, runtime gibi `67%used` token'ı üretir; aynı satırda
boşlukla ayrılırsa caption `used` olur. Mevcut Flow davranışı değiştirilmedi.

İlk production kontrolünde oluşturulan Markdown dosyalarının `—` karakterinde
kodlama hatası bulundu; dosyalar UTF-8 olarak düzeltildi. DOM eşitliği
beklentisi gevşetilmedi. Diff incelemesinde tüketici betiğinin mevcut Unicode
metinleri ve VitePress dosyalarının satır sonları da korundu.

Önceki Faz 8C raporundaki 989 toplamı başlangıç commit'i için güncel değildir:
`ae45b57` commit'i bir Markdown Flow testi daha eklemiştir. Bu teslimatta
**75 yeni test** vardır: Vue 51, Markdown 22, docs 2. Güncel toplam **1065**;
başlangıç toplamı 990'dır. Mevcut test beklentileri yalnız public/core export
listeleri ve tüketici figure sayısı (38 → 41) için genişledi. Registry öğe
sayısı 42 → 45, kaynak closure sayısı 87 → 92 oldu.

`GridFractionTypes.vue` negatif kontrolü kök `pnpm typecheck` ile çalıştı:

```text
Grid.cells: Type 'string' is not assignable to type 'number'.
Meter.value: Type 'never[]' is not assignable to type 'string | number | null | undefined'.
Waffle.columns: Type 'never[]' is not assignable to type 'string | number | undefined'.
NEGATIVE_EXIT=1
```

Fixture byte içeriği `finally` ile geri yüklendi ve sonraki typecheck geçti.
Log: `C:/Users/zahid/source/github/tmp/mdxcn-vue/f9a-negative.log`.
Tavan testleri her üç bileşende `vReveal` gecikmesini 240 ms ile sınırlar;
boş/fractional track, padding, glyph/palette, prop/slot değişimleri ve alan
öncelikleri ayrı testlerle kapsanır.

## Kabul çıktısı

Tam zincir sıralı çalıştırıldı. `pnpm install --offline --frozen-lockfile`
mevcut lockfile ve yerel bağımlılıkları kullandı; lockfile değişmedi.

| Kontrol | Çıktı |
| --- | --- |
| Install | `Lockfile is up to date, resolution step is skipped`; çıkış 0 |
| Build | Vue, Markdown ve VitePress client/server/statik sayfalar; çıkış 0 |
| Test | Vue **658 passed**, Markdown **339 passed**, docs **68 pass** |
| Lint/typecheck | ESLint ve üç workspace; çıkış 0 |
| Format | `All matched files use Prettier code style!` |
| Registry build/check | `45 items from library sources` |
| Registry CLI/kurulum | `45 items, 92 source files; typecheck and build passed` |
| Tüketici | `CONSUMER CHECK PASSED`; kayıtlı VitePress tüketicisinde 41 figure |

Tam log: `C:/Users/zahid/source/github/tmp/mdxcn-vue/f9a-acceptance.log`.
Tüketici paketleri Bundler/NodeNext tip kontrolleri, yanlış yeni prop tipleri,
tek Vue runtime, CSS ve production build ile doğrulanır. Son kabul zincirinde
başarısız veya atlanan test yoktur.

## Bilinçli farklar ve tarayıcıda kalan ölçümler

React Motion yerine ortak `vReveal` kullanılır: yalnız dolu hücreler,
240 ms tavan; Cells/Meter 30 ms, Waffle upstream gibi 6 ms artış. SSR görünür,
reduced motion desteklidir. Ortak Vue figure/caption ilişkilendirmesi korunur.
`written`, compiler'ın taşınabilir model yüzeyidir; statik numeric string props
Vue template kullanımını destekler.

Dev sunucusu, canlı tarayıcı/E2E oturumu ve npm yayını yapılmadı. Tarayıcıda
375 px container yerleşimi, uzun label ve büyük ızgaralar, glif fontları,
light/dark kontrastı, ekran okuyucu sırası, JS kapalı/reduced motion
görünürlüğü, CLS ve gerçek observer/WAAPI gecikmesi ölçülecek. Otomatik
SSR/hydration sonuçları bu ölçümlerin yerine geçmez.

Commit açık izinle imzasız, hook atlamadan ve kalıcı git config değişikliği
olmadan atılır; ardından normal push yapılır. Commit kimliği, temiz çalışma
ağacı ve `HEAD`/`origin/main` eşitliği son mesajda komutla bildirilir.
