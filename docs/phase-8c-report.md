# Faz 8C — GraphPlot ve GraphKpi

Başlangıç `main`, `bf184f5`; çalışma ağacı temizdi. Upstream checkout komutla
`16d817ad5ec54d89142e4c1cf26027b60d6df853` olarak doğrulandı. Sistemden alınan
zaman: 2026-10-07 Çarşamba 04:02 (Europe/Istanbul).

## Okuyucu kararı ve kapsam

`GraphPlot`, mevcut `seriesOf` okuyucusunu ve runtime `sparkModel` adaptörünü
kullanır. Okuyucu genişletilmedi; Bars/Spark testleri yeşil kaldı. Plot'ta
`data` bağımsız kazanır; `labels` verilmezse yazılı liste etiketleri, veri prop
verilmiş olsa bile kullanılır. Açık boş diziler kazanır.

Brifingdeki KPI için ortak okuyucu varsayımı upstream uygulamayla uyuşmuyor.
Upstream `seriesOf` yorumunda KPI adı geçmesine rağmen `GraphKpi` bu işlevi
çağırmaz; `linesOf`, `firstToken`, `splitDash` ve `numbers` kullanır. Aynı
sözleşme core `kpiOf` ve runtime `kpiModel` ile taşındı. İlk görünür satırın
token'ı değer, kalanı label/hint olur; kalan satırlar seri üretir. Doğrudan
paragraph girdileri diğer kardeş metinlerden önce gelir. Emphasis görünür
metne çevrilir; sayılar ve hint yeniden biçimlendirilmez. `value`, `label`,
`hint`, `data` alanları bağımsız kazanır; boş string/dizi korunur, null fallback
sağlar. Hesaplanan delta veya ayrı trend alanı upstream'de yoktur.

Her iki bileşende tipli props, taşınabilir `written` model, Markdown compiler,
public/core export snapshot, docs/sidebar ve registry/tüketici yolları vardır.
Inventory bu iki bileşen için item belirtmez; yeni item marker uydurulmadı.
Mevcut `Series` ESLint istisnası korundu; yeni çok kelimeli bileşen adları
istisna gerektirmez. VNode klonlama/değiştirme yoktur. Runtime okuyucuları
VitePress `header-anchor` bağlantılarını dışlar; Fragment şeffaf, custom
component opaktır.

Plot DOM/class, area/line glifleri, sıfırı kapsayan ölçek, label satırları,
progress/live cap ve ekran okuyucu özeti upstream ile eşleşir. Tick formatı
upstream gibi integer string veya bir ondalıktır; locale bağımsızdır. KPI
değer/label/hint DOM'u, dekoratif spark track ve ayrı ekran okuyucu özeti
korunur. Bu iki bileşen locale kullanan sayı formatı çağırmaz; ortak sabit
`en-US` davranışı değiştirilmedi.

## Ayrı ek düzeltme

Heatmap'te `sr-only` hücrelerin containing block alanını scroll bölgesine
taşımak için `.graph-scroll-x` utility tanımına `position: relative` eklendi.
Upstream'de olmayan `min-w-lg` kaldırıldı. Altı sütunlu DOM testi ve gerçek
build CSS cascade testi bunu sabitler. Gantt `stage` ve Matrix `accent`
solukluğu Vue uygulamasında kalıcıdır; upstream `fadeUp`/`show` opacity değerini
1 yaparak solukluğu kaldırır. İki docs sayfası ve Faz 6C raporu düzeltildi.
Bu iş `dff3b6c` commit kimliğiyle ayrı push edildi.

Brifingdeki 375 px / 143 px taşma ve 29 px hücre ölçülerini bu oturumda canlı
tarayıcıyla yeniden ölçmedim. Kod ve cascade nedeni doğrulandı; sayısal ölçüm
yeni doğrulama sonucu olarak sunulmadı.

## Doğrulama ve düzeltilen beklentiler

Altı upstream örneği bağımsız JSON fixture olarak aktarıldı. Beklenen modeller,
glifler, cap seviyeleri ve erişilebilir özetler okuyucu çıktısından üretilmedi.
Runtime slot, taşınabilir model ve doğrudan veri props girdileri aynı DOM'u
üretir. Altı örnekte görünür SSR, attrs aktarımı ve uyarısız hydration sınandı.
İki yazılı örnek gerçek VitePress build içinde compiler/runtime/doğrudan veri
DOM eşitliğini sağlar. Runtime yolunu zorlayan null `written` girdileri için
beklenen fallback uyarıları vardır.

Boş, tek, eşit, sıfır, negatif, `NaN`, invalid string, kesirli tick, progress
sınırları, label önceliği, bağımsız KPI alanları, custom glyph/palette,
kebab props, permalink ve reaktif slot/prop girdileri sınandı. İki bileşende
60 noktanın directive gecikmesi 240 ms tavanında kalır; `2*9999` girdisinin
5000 noktasının tamamı görünür SSR üretir.

İlk yeni KPI test beklentisi düzeltildi: kalan satırdaki `12,400`, upstream
`numbers` grammar ile `12` ve `400` olur; özetin ilk token'ı ise `12,400`
olarak korunur. Mevcut test beklentileri gevşetilmedi. Public export listeleri
genişledi; tüketici figure sayısı 36 → 38, registry öğe sayısı 40 → 42 oldu.
Registry closure artık 87 kaynak dosyasıdır.

`PlotKpiTypes.vue` negatif kontrolü kök `pnpm typecheck` ile iki kez çalıştı:

```text
Plot: Type '"bars"' is not assignable to type '"area" | "line" | undefined'.
Plot: Type 'string' is not assignable to type 'number'.
NEGATIVE_EXIT=1
KPI: Type 'number' is not assignable to type 'string'.
KPI: Type 'string' is not assignable to type 'number'.
NEGATIVE_KPI_EXIT=1
```

Fixture byte içeriği `finally` ile geri yüklendi; sonraki typecheck geçti.
Kanıtlar `C:/Users/zahid/source/github/tmp/mdxcn-vue/f8c-negative.log` ve
`f8c-negative-kpi.log` dosyalarında.

Tam kabul zinciri sıralı çalıştırıldı. `pnpm install` için mevcut lockfile ve
yerel bağımlılıkları kullanan `--offline --frozen-lockfile` bayrakları seçildi;
yeni yazılım kurulmadı, lockfile değişmedi.

| Kontrol | Çıktı |
| --- | --- |
| Install | Lockfile güncel; resolution atlandı, çıkış 0 |
| Build | Vue, Markdown, VitePress client/server ve statik sayfalar başarılı |
| Test | Vue **607 passed**, Markdown **316 passed**, docs **66 pass**; toplam **989** |
| Yeni test | **66**: Vue 48 (47 Plot/KPI + 1 Heatmap), Markdown 16, docs 2; başlangıç 923 |
| Lint/typecheck | ESLint ve üç workspace çıkış 0 |
| Format | `All matched files use Prettier code style!` |
| Registry build/check | `42 items from library sources` |
| Registry CLI/kurulum | `42 items, 87 source files; typecheck and build passed` |
| Tüketici | `CONSUMER CHECK PASSED`; kayıtlı VitePress tüketicisinde 38 figure |
| Paket tipleri | Bundler/NodeNext; yanlış Plot variant ve KPI string sayı dizisi reddedildi |
| Tree shaking | Tek Vue runtime; full 278907 byte, GraphStack 168466 byte |
| Yalnız kütüphane | Vue hariç full 104736 byte, GraphStack 14463 byte |

Tam log `C:/Users/zahid/source/github/tmp/mdxcn-vue/f8c-acceptance.log`;
tüketici ölçümleri aynı dizindeki `consumer-results.json` dosyasında.
Doğrudan veri DOM karşılaştırması eklendikten sonra ilgili Vue testleri,
typecheck, build ve bütün testler yeniden çalıştırıldı. Son kontrolde başarısız
veya atlanan test yoktur. Diff kaynaklar ve gerçek çağıranlar üzerinden
incelendi; kapsam dışı bileşen davranışı değiştirilmedi.

## Bilinçli farklar ve kalan tarayıcı kontrolleri

React Motion yerine ortak `vReveal`: 30 ms artış, toplam 240 ms gecikme tavanı.
SSR görünürdür; KPI mono soluk noktaları hydration öncesinde de 0.4 opacity
korur. Ortak Vue figure/caption ilişkilendirmesi ve reduced motion davranışı
korundu. `written` compiler'ın taşınabilir model yüzeyidir.

Dev sunucusu, canlı tarayıcı/E2E oturumu ve npm yayını yapılmadı. Tarayıcıda
375 px Heatmap yatay taşması/hücre genişliği, uzun Plot/KPI serileri, eksen
hizası, glif fontları, light/dark kontrastı, ekran okuyucu sırası, JS kapalı ve
reduced motion görünürlüğü, CLS ve gerçek observer/WAAPI gecikmesi ölçülecek.
Otomatik testler bu ölçümlerin yerine geçmez.

Commit'ler açık izinle imzasız, hook atlamadan ve kalıcı git config değişikliği
olmadan atılır; her commit sonrası normal push yapılır. Son commit kimliği,
temiz çalışma ağacı ve `HEAD`/`origin/main` eşitliği son mesajda komutla
doğrulanmış olarak bildirilir.
