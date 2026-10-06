# Faz 6B — GraphStat, GraphSlope ve GraphBullet

Başlangıç `main`, `8a31fcd`; çalışma ağacı temizdi. Upstream checkout
`16d817ad5ec54d89142e4c1cf26027b60d6df853` komutla doğrulandı. Üç bileşen,
ilgili `graph-frame` metin yardımcıları ve altı upstream örnek okundu.
`GraphGantt`, `GraphDiff`, `GraphWaterfall` kapsam dışı kaldı.
Dev sunucusu başlatılmadı; npm yayını ve yeni bağımlılık ekleme yapılmadı.

## Ortak okuyucu kararı

`numericList` runtime VNode girdisini klonlamadan düz liste modeline okur;
üç bileşen bu adaptörü paylaşır. Stat, 6A `firstToken` ve mevcut `splitDash`
yardımcılarını kullanır; değer token'ı sayıya çevrilmez. Birimler, binlik
virgüller, delta ve yüzde ipuçları metin olarak aynen korunur.
Slope için `splitLabel` ve ok ayracı; Bullet için `splitLabel`, `/` ve `of`
ayraçlarıyla ayrı grammar gerekir. İki model mevcut `numberOf` işlevini
kullanır: binlik virgül kaldırılır, sayının başlangıcı okunur, eksik/geçersiz
ve sonlu olmayan değer 0 olur. Unicode eksi sayı token'ı da upstream gibi
0 olur. Genel bir etiket/sayı parser zorlanmadı.

Brifingdeki delta/yüzde ifadesi hesaplanan bir yeni alan olarak uygulanmadı:
Stat örneklerinde bunlar `hint` metnidir. Slope iki sayı gösterir; artış ve
azalışta aynı `→` glifini, eşitlikte `–` glifini kullanır. Yön renk ile ayrılır.
Bullet aralık bandı çizmez; maksimum ölçeği ve hedef `|` işareti gösterir.
Upstream kodu bu davranışlar için esas alındı.

## Uygulama

- Tipli `GraphStatProps`, `GraphSlopeProps`, `GraphBulletProps`; `StatItem`,
  `SlopeItem`, `BulletItem`, `BulletRow` modelleri; `Stat`, `Slope`, `Target`
  item adaptörleri ve public API/core export kayıtları eklendi.
- Veri `items` → açık derleyici `list` → boş olmayan runtime liste → item
  sırası uygulanır. Boş veri veya açık `list` dizisi fallback girdisini
  bastırır; null sonraki girdiye geçer. Item label verilmezse slot metni
  kullanılır; açık boş label korunur.
- Upstream DOM, class ve a11y korundu: Stat 1–4 responsive sütun, accent ve
  isteğe bağlı hint; Slope başlıkları, sayı biçimleri ve yön tonları; Bullet
  satır ölçeği, hedef sınırlandırması, hedef sonrası ikincil ton, dekoratif
  köşeli parantezler, özelleştirilebilir glifler ve `aria-label`.
- `vReveal` Stat için 60 ms artış/300 ms tavan, Slope ve Bullet için
  50 ms artış/250 ms tavan kullanır. Her birinde 60 satırdan yalnız son
  satır görünürken gecikme tavanı komutla sınandı.
- Altı bağımsız upstream fixture, production VitePress sayfasında 24 figure
  ile Markdown/host/props/item yollarının aynı DOM'u üretmesini doğrular.
  Caption kimlikleri özgün, SSR görünür, hydration uyarısız ve DOM eşittir.
  Üç bileşende derlenmiş dinamik slot şablonu reaktif olarak güncellendi.
- Markdown derleyicisi, docs sayfaları/sidebar, README, envanter açıklaması,
  ESLint item istisnaları ve registry üretimi güncellendi.

## Kabul çıktısı

Tam zincirin yedi adımı da **çıkış 0** verdi:

```sh
pnpm install && pnpm -r build && pnpm -r test && pnpm lint && pnpm typecheck && pnpm format:check && pnpm consumer:check
```

| Kontrol | Sonuç |
| --- | --- |
| Install | `Already up to date` |
| Build | Vue/Markdown ve VitePress client/server/statik sayfalar başarılı |
| Test | Vue 375, Markdown 194, docs 48; **toplam 617**, atlanan yok |
| Yeni test | **51**: Vue 34, Markdown 14, docs 3 |
| Lint / typecheck | ESLint ve üç workspace başarılı |
| Format | `All matched files use Prettier code style!` |
| Registry build | `REGISTRY BUILD PASSED: 25 items from library sources` |
| Consumer | `CONSUMER CHECK PASSED` |
| Kayıtlı VitePress tüketicisi | 21 figure; Stat hint, Slope değerleri, Bullet hedefleri doğrulandı |
| Registry CLI | 25 öğe, 57 kaynak dosya; payload eşitliği, typecheck/build başarılı |
| Paket tipleri | Bundler/NodeNext, `skipLibCheck=false`; yanlış alan türleri reddedildi |
| Tree shaking | Tek Vue runtime; full 224639 byte, GraphStack 167210 byte |
| Yalnız kütüphane | Vue hariç full 60051 byte, GraphStack 13289 byte |

`MetricTypes.vue` fixture içindeki Stat değerine geçici `true` verildi;
kök `pnpm typecheck` çıkış 1 verdi:

```text
test/fixtures/MetricTypes.vue(4,30): error TS2322: Type 'boolean' is not assignable to type 'string | number'.
```

Fixture özgün byte içeriğine geri yüklendi; son tam zincirde typecheck geçti.
Kanıtlar `C:/Users/zahid/source/github/tmp/mdxcn-vue/` altında
`f6b-acceptance.log`, `f6b-negative.log`, `f6b-consumer-first.log` ve
`consumer-results.json` dosyalarındadır.

## Düzeltilen sorunlar ve beklentiler

İlk yeni reaktif test bütün figure metninde eski label arıyordu; Slope sabit
`fromLabel="before"` başlığını da kapsadığı için yanlış başarısız oldu.
Kontrol değişen `li` satırına daraltıldı. Yeni Markdown testindeki paragraf
metni beklentisi `read Note` → `readNote` olarak düzeltildi: upstream `textOf`
paragrafları araya boşluk eklemeden birleştirir. Test girdilerindeki union
çıkarımı ve ham boolean attribute testinin TypeScript türü düzeltildi.

İlk consumer kontrolü registry dosya eşitliğinde başarısız oldu: gerçek
shadcn-vue CLI, doğrudan object dönüşündeki `as T` ifadesinin parantezlerini
yeniden yazıyordu. Adaptör yerel değişken üzerinden dönecek şekilde
düzeltildi. Eşitlik beklentisi gevşetilmedi; registry yeniden üretildi ve
son tam kabul zincirinde gerçek CLI kurulumuyla geçti.

Mevcut public API snapshot'larına yeni export adları eklendi; kayıtlı
tüketici figure beklentisi 18 → 21, registry öğeleri 22 → 25 oldu.
Eski bileşen davranış beklentisi değiştirilmedi. 6A raporundaki 552 test
sayısı o teslimatın kanıtıdır; bu teslimatın başlangıcındaki sonraki
regresyon testlerini kapsamaz. Mevcut dosyaların satır sonları korundu.

## Bilinçli farklar ve tarayıcı kontrolleri

React Motion yerine mevcut `vReveal`, Vue item marker ve compiler `list`
girdisi kullanılır. Bullet `ticks` string biçimi Vue attribute kullanımını
destekler. Custom bileşen sınırları opak, Fragment şeffaftır. Stat responsive
class adları Tailwind taraması için literal tutulur. Sıfır veya negatif
açık `max` ve sınır dışı hedefler upstream matematiğini izler; örneğin
`value=0,target=0,max=0` hedef işareti üretmez. Yeni ölçek düzeltmesi eklenmedi.

Tarayıcı/E2E oturumu yapılmadı. Light/dark, dar ekranda Stat sütunları ve
Slope sabit sayı sütunlarının taşması, uzun label kırpılması, Bullet hedef
kontrastı, ekran okuyucu sırası, JS kapalı ve reduced motion görünürlük,
CLS ve gerçek observer/WAAPI gecikmesi tarayıcıda ölçülecek.
Otomatik hydration bu canlı kontrollerin yerine geçmez.

Teslimat açık izinle imzasız commit, hook atlamadan normal push ile yapılır;
commit kimliği, temiz çalışma ağacı ve `origin/main` eşitliği son mesajda
komutla doğrulanmış olarak bildirilir.
