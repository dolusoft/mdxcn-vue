# Faz 6C — Chat margin ve numeric-list son teslimatı

Başlangıç `main`, `815c017`; çalışma ağacı temizdi. Upstream checkout
`16d817ad5ec54d89142e4c1cf26027b60d6df853` komutla doğrulandı. Üç kaynak,
ortak okuyucular ve yedi upstream örnek okundu. Sistem zamanı:
2026-10-07 Çarşamba 02:50 (Europe/Istanbul).

## Brifingden düzeltilen varsayımlar

- `GraphGantt` tarih aralığı çizmez: `start`/`end` sayısal kesirler,
  `ticks` metin etiketleridir. Tarih parser eklenmedi. Geçersiz değerler ve
  tarih benzeri stringlerin upstream `numberOf` davranışı test edildi.
- `GraphDiff` üç örnek içerir; toplam yedi bağımsız örnek/28 figure kullanıldı.
- `Keys` liste satırı yerine `dl` kullanır; `li + li` kuralı uygulanmaz.
- README içindeki eski registry sayıları gerçek üretilen 28 öğe ile düzeltildi.

## Uygulama ve ortak okuyucu kararı

`Chat` için katmansız `li + li { margin: 0 }` kuralı `revert-layer` oldu.
Gerçek build CSS'i ve en son yüklenen VitePress kurallarıyla cascade testi,
`mt-4`/`mt-1` utility kurallarının kazanmasını, utility taşımayan liste
satırlarının preflight `margin: 0` değerini korumasını doğruluyor.
Steps, Changelog, Decision, Env, GraphStack ve tamamlanan bütün numeric-list
bileşenleri kapsanıyor; Keys için gerçek `dl` yapısı doğrulanıyor.

`GraphGantt`/`Span`, `GraphDiff`/`Line`, `GraphWaterfall`/`Delta` tipli props,
framework bağımsız modeller ve item adaptörleriyle eklendi. Gantt/Waterfall
ortak `numericList` okuyucusunu kullanıyor. Diff, aynı düz metin/strong
açıklamasını kullanırken `itemParts` ile ilk paragrafın doğrudan `del`/`s`
host yapısını ayrı okuyor: yalnız metin modeli rewrite bilgisini kaybederdi.
`ProseNode` modeline `del` eklendi; Markdown compiler strike token desteği
yalnız GraphDiff için etkin. Yeni yollarda VNode klonlama/değiştirme yok.

Veri → açık compiler `list` → boş olmayan runtime liste → item önceliği
uygulandı. Boş veri/list dizisi fallback girdisini bastırır; null fallback
verir. Diff `rows` ve `footer` alanlarını bağımsız seçer, ilk `total` footer
kazanır. Boş `rows` liste footer alanını bastırmaz. Açık boş item label korunur.

Upstream DOM/class/a11y, Gantt completion/playhead/stage/tick etiketleri,
Diff işaretleri ve ortak prefix rewrite, Waterfall kümülatif aralıklar,
negatif running total ve açık start/end reset davranışı korundu.
Gantt/Waterfall 50 ms artış/250 ms tavan; Diff 40 ms artış/200 ms tavan
kullanır. Her birinde 60 satırdan yalnız son satır görünürken tavan test edildi.

Yedi örneğin Markdown, runtime host, prop ve item yolları aynı DOM'u üretiyor;
caption kimlikleri özgün ve SSR görünür. Üç bileşen uyarısız hydration ve
derlenmiş dinamik slot güncellemelerini geçiyor. Hydration Gantt ekseni/playhead,
Diff rewrite/footer ve negatif Waterfall toplamını da kapsıyor.
Waterfall sayıları upstream gibi açık `en-US` locale ile biçimlenir;
tarih biçimleme ve timezone bağımlılığı yoktur. Unicode eksi numeric girdisi
upstream gibi 0 olur; son satır toplamı otomatik hesaplanmaz, verileni kullanır.

Docs/sidebar, README, inventory, public API/core export snapshot'ları,
ESLint item adları ve registry/consumer doğrulamaları güncellendi.

## Kabul çıktısı

Tam zincir **çıkış 0** verdi:

```sh
pnpm install && pnpm -r build && pnpm -r test && pnpm lint && pnpm typecheck && pnpm format:check && pnpm consumer:check
```

| Kontrol | Sonuç |
| --- | --- |
| Install | `Already up to date`, lockfile değişmedi |
| Build | Vue, Markdown, VitePress client/server/statik sayfalar başarılı |
| Test | Vue 397, Markdown 213, docs 51; **661**, başarısız/atlanan yok |
| Yeni test | **44**: Vue 22, Markdown 19, docs 3; başlangıç 617 |
| Lint / typecheck | ESLint ve üç workspace başarılı |
| Format | `All matched files use Prettier code style!` |
| Registry build/check | `28 items from library sources` |
| Registry CLI | 28 öğe, 62 kaynak dosya; payload eşitliği, typecheck/build başarılı |
| Tüketici | `CONSUMER CHECK PASSED`; kayıtlı VitePress tüketicisinde 24 figure |
| Paket tipleri | Bundler/NodeNext, `skipLibCheck=false`; yanlış alan türleri reddedildi |
| Tree shaking | Tek Vue runtime; full 234994 byte, GraphStack 167628 byte |
| Yalnız kütüphane | Vue hariç full 68106 byte, GraphStack 13672 byte |

`GanttDiffWaterfallTypes.vue` fixture içindeki `start` alanına geçici `true`
verildi; kök `pnpm typecheck` çıkış 1 verdi:

```text
test/fixtures/GanttDiffWaterfallTypes.vue(4,31): error TS2322: Type 'boolean' is not assignable to type 'string | number'.
```

Fixture özgün byte içeriğine geri yüklendi; son tam zincirde typecheck geçti.
Kanıtlar `C:/Users/zahid/source/github/tmp/mdxcn-vue/` altında
`f6c-acceptance.log`, `f6c-negative.log`, `f6c-consumer.log` ve
`consumer-results.json` dosyalarındadır.

## Test beklentileri ve çalışma sırasında düzeltilen sorunlar

Mevcut cascade testi artık graph reset selector yerine base margin değerini
bekliyor; `revert-layer` seçilen değeri base katmanından aldığı için gereklidir.
Tailwind `mt-1` ifadesini `var(--spacing)` olarak sadeleştiriyor;
eklenen test gerçek derlenmiş ifadeye göre düzeltildi. Keys testine önce yanlış
tablo varsayımı eklenmişti; gerçek `dl` yapısına uyarlandı. İlk Chat commit'i
bu test kırmızıyken atıldı; yanlış komut sırası kabul hatasını commit öncesi
durdurmadı. Düzeltme ayrı commit ile push edildi; son zincir yeşil.

Yeni Gantt testi duo palette için yanlış opacity beklentisi taşıyordu;
upstream `seriesDim` yalnız mono palette için 0.4 tanımlar; ancak motion
`show` varyantı opacity değerini 1 yaparak bu solukluğu kaldırır. Vue
uygulamasında `stage` solukluğu kalıcıdır. Test iki durumu da
doğrulayacak şekilde düzeltildi. Diff dekoratif `+` kontrolü graph köşelerini
de içeriyordu; selector satır işaretlerine daraltıldı. Yeni Gantt playhead
selector gerçek span track yapısına düzeltildi. Gereksiz regex escape lint
hatası düzeltildi. Hiçbir eski bileşenin veri/davranış beklentisi gevşetilmedi.

Public API snapshot'ları yeni export adlarıyla genişledi; kayıtlı tüketici
figure beklentisi 21 → 24, registry öğeleri 25 → 28 oldu. Registry payload
değişiklikleri yeni dependency closure ve ortak `ProseNode` türünden üretildi.
Mevcut dosyaların satır sonları korundu.

## Bilinçli farklar ve tarayıcıda ölçülecekler

React Motion yerine mevcut `vReveal`, Vue item marker ve compiler `list`
girdisi kullanılır. Gantt `columns` ve Waterfall `ticks` string biçimi Vue
attribute kullanımını destekler. Custom component sınırları opak, Fragment
şeffaftır. Upstream sayı grammar, clamping ve sıfır genişlikte en az bir hücre
çizme davranışı korunur.

Dev sunucusu, canlı tarayıcı/E2E oturumu ve npm yayını yapılmadı; yeni bağımlılık
eklenmedi. Chat için gerçek 16/4 px margin ve 302 px figure yüksekliği yeniden
ölçülecek. Light/dark, dar ekran taşması, uzun label kırpılması, Gantt playhead
hizası, Diff işaret kontrastı, negatif Waterfall hizası, ekran okuyucu sırası,
JS kapalı/reduced motion görünürlük, CLS ve gerçek observer/WAAPI gecikmesi
tarayıcı kontrolleridir. Otomatik cascade/hydration bu ölçümlerin yerine geçmez.

Teslimat açık izinle imzasız commit, hook atlamadan normal push ile yapılır.
Commit kimlikleri, temiz çalışma ağacı ve `origin/main` eşitliği son mesajda
komutla doğrulanmış olarak bildirilir.
