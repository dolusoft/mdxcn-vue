# Faz 7C — GraphSheet ve GraphInvoice

Başlangıç `main`, `de44950`; çalışma ağacı temizdi. Upstream checkout
`16d817ad5ec54d89142e4c1cf26027b60d6df853` komutla doğrulandı.
Sistem zamanı `Get-Date` çıktısından: 2026-10-07 Çarşamba 03:26
(Europe/Istanbul).

## Doğrulanan davranış ve brifing düzeltmeleri

- Invoice tutarları `string` değerleridir. Upstream ara toplam/vergi/toplam
  hesabı veya para biçimlendirmesi yapmaz; `Intl`/`toLocaleString` çağrısı
  yoktur. Negatif, sıfır, ondalık, binlik ayracı ve `NaN` literal kalır.
  `moneyLine` yalnız para tutarlı paragrafı ayırır; virgülden oluşan tutarı
  bile upstream regex gibi kabul eder. Sabit locale testi gerekmiyor.
- Sheet ve Invoice ortak tablo okuyucusunun ayırdığı Markdown footer
  değerini kullanmaz. Birden fazla veri satırında son satırın ilk hücresi
  `Total` veya tamamen kalınsa satır ayrılır; tek veri satırında ayrılmaz.
  Açık `tfoot` da item verisine katılmaz. Sheet footer yalnız prop/`Foot`
  girdisinden gelir. Invoice `Total` item veya para tutarlı paragrafları
  tablo dışında `dl` ile gösterir; kalın paragraf accent sağlar.
- Upstream native `table`, `thead`, bölüm başına `tbody`, `td` bölüm başlığı
  ve Invoice `dl` semantiği korundu. `GraphTable` için daha önce eklenen
  `scope`, odaklanabilir kaydırma bölgesi ve tablo adlandırma alanları
  bu iki bileşene aktarılmadı. Ortak Vue `Graph` figure/caption ilişkisi
  korundu; GraphRule ve düşey ayraçlar dekoratif kalır.
- Başlangıç test sayısı 7B raporundaki 738 değildir: `de44950` commit'i bir
  Matrix regresyon testi ekler. `git show` ile doğrulanan başlangıç **739**.

## Okuyucu kararı ve uygulama

Ortak `headingSections`, `tableOf`, `cellsOf`, `alignsOf` ve `resolveTable`
işlevleri değiştirilmedi. Yeni `resolveSheet` mevcut alan önceliğini
yeniden kullanır ve Markdown footer fallback girdisini kaldırır. Sheet
Markdown hücreleri upstream gibi düz metindir; veri/item hücreleri Vue
VNode veya taşınabilir prose taşıyabilir. VNode klonlanmaz.

Markdown compiler içindeki mevcut GraphTable okuması `readTable` işlevine
taşındı; GraphTable, Sheet ve Invoice aynı algılamayı kullanır. 7A/7B ve
GraphTable testleri değişmeden yeşil kaldı. Heatmap/Matrix/Compare bozuk
gövde uyarısında GraphTable adı gerçek bileşen adıyla değiştirilir; özgün
hata `cause` alanında korunur. Üç bileşende doğrudan parser ve plugin
uyarı kontrolleri eklendi.

Sheet `headers`, `sections`, `footer`, `align` alanlarını ayrı seçer:
prop → item → Markdown; footer Markdown kullanmaz. Boş diziler kazanır,
null fallback verir. Boş `Head` kazanır; yalnız ilk başlık bölümü headers
ve alignment sağlar. İlk bölüm boşsa sonraki tablo bu alanları doldurmaz.
Section `rows` prop girdisi boş olsa bile nested Row girdisinden önce gelir.

Invoice `meta`, `items`, `totals` alanları bağımsızdır: prop → marker →
Markdown. Party string değerleri satır bazında temizlenir; boş string
From/To fallback sağlamaz, null sağlar. Item description, Meta value ve
Total label/value slot metninden tamamlanır. İlk para tutarı olmayan
paragraf note olur; boş note prop girdisi bunu bastırır. Sütunlar herhangi
bir item üzerinde qty/rate alanının varlığıyla belirlenir. Eksik hücreler,
header regex ve konumsal qty/rate/amount fallback upstream ile aynıdır.

Tipli props, core modelleri, marker adaptörleri, public/core export'ları,
ESLint tek kelimeli ad istisnaları, Markdown compiler/plugin, iki docs
sayfası/sidebar ve registry eklendi. Invoice `from`/`to` alanları compiler
modelinden üretilmediği için açık party props ile derleme güvenlidir;
modelle çakışan açık veri alanları mevcut runtime fallback yolunu korur.

## Doğrulama ve çalışırken düzeltilenler

Dört upstream örneği (`RFC`, `SURFACE`, `INVOICE 0041`, `QUOTE`) yerel
`components/docs/examples.tsx` içinden alındı. Beklenen modeller parser
çıktısından üretilmedi; bağımsız fixture olarak kaydedildi. Runtime host
ve veri yollarının modelleri/DOM'u, compiler modeli ve VitePress üzerinde
compiler/veri DOM eşitliği doğrulandı. Reaktif derlenmiş slotlar ve prop
değişiklikleri yeni mount ile karşılaştırıldı. Dört örnekte görünür SSR,
uyarısız hydration ve attrs aktarımı test edildi. Sheet satırları, Invoice
satırları ve Invoice toplamları için 60. öğe reveal tavan testi vardır.

- Yeni accent testindeki genel sınıf seçicisi Graph başlığını seçiyordu;
  `dd.text-graph-accent` ile tutar hücresi seçildi.
- Fixture tipindeki nullable sections, statik boolean test girdisi ve
  animate mock tipi TypeScript kontrolüne uygun düzeltildi. ESLint hata
  yeniden adlandırmada `cause` istedi; eklendi.
- Yeni tabloların VitePress tablo CSS etkisini kaldırması gerektiği
  gerçek host CSS ile doğrulandı. Yalnız yeni bileşenlere ait
  `graph-sheet-table`/`graph-invoice-table` sınıfları ve dar CSS kuralları
  eklendi. Mevcut bileşen seçicileri değiştirilmedi. Sheet GraphBody
  padding sınıfları Vue'da birleştirilince çakışıyordu; upstream'in
  birleşmiş padding değerleri doğrudan gövde kabına uygulandı.
- Yeni cascade testinde varsayılan font/color değerinin kalıtımdan
  gelebileceği ve Tailwind `px-0` çıktısının `0` olduğu doğrulandı.
  Yalnız yeni beklentiler düzeltildi; mevcut test beklentileri gevşetilmedi.
- Registry belgesindeki güncel üretim sayısı eski 10 → 35 olarak düzeltildi;
  Faz 4A tarihsel kurulum kanıtı değişmedi.

## Kabul

Son tam zincir **çıkış 0**, log son satırı `ACCEPTANCE_EXIT=0`:

```sh
pnpm install && pnpm -r build && pnpm -r test && pnpm lint && pnpm typecheck && pnpm format:check && pnpm consumer:check
```

| Kontrol | Çıktı |
| --- | --- |
| Install | `Already up to date`; lockfile değişmedi |
| Build | Vue, Markdown, VitePress client/server ve statik sayfalar başarılı |
| Test | Vue `479 passed`, Markdown `251 passed`, docs `59 pass`; **789**, başarısız/atlanan yok |
| Yeni test | **50**: Vue 35, Markdown 13, docs 2; başlangıç 739 |
| Lint/typecheck | ESLint ve üç workspace çıkış 0 |
| Format | `All matched files use Prettier code style!` |
| Registry build/check | `35 items from library sources` |
| Registry CLI/kurulum | `35 items, 75 source files; typecheck and build passed`; gerçek CLI payload eşitliği |
| Tüketici | `CONSUMER CHECK PASSED`; kayıtlı VitePress tüketicisinde 31 figure |
| Paket tipleri | Bundler/NodeNext, `skipLibCheck=false`; sayısal Invoice amount reddedildi |
| Tree shaking | Tek Vue runtime; full 259275 byte, GraphStack 168136 byte |
| Yalnız kütüphane | Vue hariç full 88468 byte, GraphStack 14143 byte |

`SheetInvoiceTypes.vue` fixture içinde geçici olarak `align: 'middle'` ve
sayısal Invoice `amount` kullanıldı. Kök `pnpm typecheck` çıkış 1 verdi:

```text
test/fixtures/SheetInvoiceTypes.vue(10,14): error TS2322: Type '"middle"' is not assignable to type 'GraphAlign'.
test/fixtures/SheetInvoiceTypes.vue(17,44): error TS2322: Type 'number' is not assignable to type 'string'.
```

Fixture özgün byte içeriğine `finally` ile geri yüklendi; takip eden
typecheck ve son tam zincir geçti. Kanıtlar
`C:/Users/zahid/source/github/tmp/mdxcn-vue/f7c-acceptance.log`,
`f7c-negative.log` ve `consumer-results.json` dosyalarındadır.

Build sırasında mevcut runtime fallback fixture uyarıları beklenir;
CLI bağımlılıklarında deprecated uyarıları vardır. Kabul komutları
başarılıdır; hook veya kontrol atlanmadı.

## Beklentiler ve sınırlar

Public/core export listeleri genişledi; kayıtlı tüketici figure sayısı
29 → 31, registry öğe sayısı 33 → 35 oldu. CSS cascade testine yalnız
Sheet/Invoice kontrolleri eklendi. Yeni iki bileşen dışında mevcut
bileşen implementasyonları değiştirilmedi.

Motion yerine mevcut `vReveal` kullanılır: 40 ms artış, 240 ms tavan.
Bu animasyon farkı ve host CSS sınıfları bilinçlidir. SSR görünürdür;
reduced motion ortak directive davranışını kullanır.

Dev sunucusu, canlı tarayıcı/E2E oturumu ve npm yayını yapılmadı.
Tarayıcıda dar ekran yatay kaydırma, uzun description/party metni,
Sheet bölüm/ayraç yerleşimi, Invoice toplam hizası, light/dark kontrastı,
native bağlantı focus göstergesi, ekran okuyucu tablo/bölüm okuma sırası,
JS kapalı/reduced motion, CLS ve observer/WAAPI gecikmesi ölçülecek.
Otomatik SSR/hydration/cascade bu ölçümlerin yerine geçmez.

Teslimat açık izinle imzasız commit ve hemen ardından normal push
kullanır; kalıcı git config değiştirilmez. Commit kimliği, temiz çalışma
ağacı ve `origin/main` eşitliği son mesajdan önce komutla doğrulanır.
