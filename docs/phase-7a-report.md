# Faz 7A — Compare, Matrix ve Heatmap

Başlangıç `main`, `875e655`; çalışma ağacı temiz ve upstream checkout
`16d817ad5ec54d89142e4c1cf26027b60d6df853` komutla doğrulandı. Sistem zamanı
2026-10-07 Çarşamba 03:02 (Europe/Istanbul), `Get-Date` çıktısından alındı.

## Brifingden düzeltilen varsayımlar

- Upstream üç bileşeni native tablo ile çizmez: grid, `ul`, `li` ve `span`
  kullanır. Brifingin native `table` ve `th scope` isteği bilinçli Vue
  erişilebilirlik farkı olarak uygulandı; birebir upstream DOM iddiası yoktur.
- Başlangıç test sayısı önceki Faz 6C raporundaki 661 değil, 662'dir:
  başlangıç commit'i `875e655`, GraphStat için bir regresyon testi eklemiştir.
- Matrix/Heatmap boş Markdown hücrelerini atlar; sütun konumlarını korumak
  amacıyla sıfır eklemek upstream davranışını değiştirirdi. Compare ise boş
  hücreyi korur. Bu fark doğrudan kaynak ve testlerle doğrulandı.

## Uygulama

`GraphCompare`/`Col`, `GraphMatrix`, `GraphHeatmap`; tipli props, framework
bağımsız modeller, item adaptörü, paket/core export'ları, Markdown compiler,
docs/sidebar ve registry eklendi. `Faq`, `GraphBoard`, `GraphSheet`,
`GraphInvoice` dosyalarına dokunulmadı. Yeni bağımlılık yoktur.

Ortak `tableOf`, `toLabeledTable`, `resolveTable` okuyucuları **değişmedi**.
Yeni `labeledModel` adaptörü ve `resolveLabeledTable` işlevi bu okuyucuların
üzerine kaynak seçimini ekler. Compiler mevcut `GraphTable` token okuyucusunu
yeniden kullanarak `table: TableModel` taşır; yeni bir tablo parser yazılmadı.
`GraphTable`/`Endpoint` regresyonları ve mevcut tablo cascade beklentileri
korunur. Veri → boş olmayan item dizisi → tablo önceliği alan bazında uygulanır;
boş veri dizisi fallback girdisini bastırır, null fallback verir. Compare
sütunları prop → `Col` → tablo; diğerlerinde prop → tablo sırasındadır.

Girdide VNode klonlama/değiştirme yoktur. Satırlar her render sırasında
okunur; derlenmiş `v-for`, inline `strong`, dinamik label/sütun/hücre
güncellemeleri yeni mount ile aynı DOM'u üretir. Altı upstream örneği için
compiler, runtime host, veri ve item yolları 24 figure üzerinde aynı DOM'u
üretir. Caption kimlikleri özgün; SSR içerik görünür ve hydration uyarısızdır.
Üç bileşenin 60. satırında `vReveal` gecikmesi 200 ms ile sınırlıdır
(40 ms artış). SSR/reduced motion mevcut directive davranışını kullanır.

Compare metin boolean grammar, gerçek boolean glifleri, string verinin
string kalması, column accent, mono/duo/multi renk ve dim kuralları korunur.
Matrix `Number`/finite token ayrımı, `en-US` biçimleme ve en fazla bir kesir
basamağı, her palette için row accent/dim ve dikey kurallar korunur.
Heatmap ortak `numbers`, run token genişletme, sıfır/negatif/eşit/eksik/NaN
veri, peak/max, glyph ve renk ölçeği, legend/caption dalları test edilir.
Metinde NaN/Infinity atılır; veri dizisindeki NaN korunup upstream gibi
peak hesabını etkiler. Tarih ya da locale varsayımı eklenmedi.

Native tablo row/column header ve caption ile adlandırılan odaklanabilir
`role=region` kaydırma bölgesi içerir. Heatmap glifleri `aria-hidden`, sayısal
değerler hücrelerde `sr-only` metin olarak erişilebilirdir. Upstream row
`aria-label` yerine native hücre/header ilişkileri kullanılır. Matrix
boyut özeti korunur. Tablo genişlik/spacing yapısı native yerleşime uyarlandı;
grid şablonları ile piksel eşitliği iddia edilmez.

## Çalışma sırasında düzeltilen sorunlar

Yeni testte Matrix özeti selector'ü ilk `sr-only` hücreyi seçiyordu; son
özet öğesine daraltıldı. Item HTML için parser'ın gerçek hatası
`Unsupported inline token` olduğundan yeni test beklentisi düzeltildi.
Union fixture tür çıkarımı ve animation mock imzası düzeltildi;
kullanılmayan mock parametrelerinden doğan lint hatası giderildi.

Mevcut tablo reset'leri yeni hücre utility padding/renk/hiza kurallarını
bastırıyordu. Yalnız `graph-labeled-table` sınıfına scoped `revert-layer`
kuralları eklendi; `tbody td` ve `th.text-left`/`th.text-right` specificity
eşleştirildi. Gerçek build CSS'i ve en son yüklenen VitePress CSS'iyle
cascade doğrulanır. Test resolver'ü Tailwind'in `padding-block` ve
`padding-inline` ifadelerini de okuyacak biçimde genişledi; eski beklentiler
gevşetilmedi.

İlk tam zincirde registry CLI, generic object `as R` ifadesini yeniden
yazdı (ek parantez/noktalı virgül); payload eşitliği haklı olarak kırmızı
oldu. Adaptör generic value türüyle cast gerektirmeden çalışacak biçimde
düzenlendi. CLI/payload eşitliği kontrolü korunarak registry yeniden üretildi.

## Kabul

Tam zincir **çıkış 0** verdi:

```sh
pnpm install && pnpm -r build && pnpm -r test && pnpm lint && pnpm typecheck && pnpm format:check && pnpm consumer:check
```

| Kontrol | Çıktı |
| --- | --- |
| Install | `Already up to date`; lockfile değişmedi |
| Build | Vue, Markdown, VitePress client/server/statik sayfalar başarılı |
| Test | Vue `420 passed`, Markdown `228 passed`, docs `54 pass`; **702**, başarısız/atlanan yok |
| Yeni test | **40**: Vue 22, Markdown 15, docs 3; başlangıç 662 |
| Lint/typecheck | ESLint ve üç workspace çıkış 0 |
| Format | `All matched files use Prettier code style!` |
| Registry build/check | `31 items from library sources` |
| Registry CLI | `31 items, 67 source files; typecheck and build passed`; payload eşitliği korunur |
| Tüketici | `CONSUMER CHECK PASSED`; kayıtlı VitePress tüketicisinde 27 figure |
| Paket tipleri | Bundler/NodeNext, `skipLibCheck=false`; üç bileşenin yanlış hücre türleri reddedildi |
| Tree shaking | Tek Vue runtime; full 244693 byte, GraphStack 167463 byte |
| Yalnız kütüphane | Vue hariç full 76165 byte, GraphStack 13676 byte |

`LabeledTableTypes.vue` fixture içinde Heatmap `values: [0, 4]` geçici
olarak `values: ['invalid', 4]` yapıldı. Kök `pnpm typecheck` çıkış 1 verdi:

```text
test/fixtures/LabeledTableTypes.vue(15,38): error TS2322: Type 'string' is not assignable to type 'number'.
```

Fixture özgün byte içeriğine `finally` ile geri yüklendi; son tam zincirde
typecheck geçti. Kanıtlar `C:/Users/zahid/source/github/tmp/mdxcn-vue/`
altında `f7a-acceptance.log`, `f7a-negative.log` ve güncel
`consumer-results.json` dosyalarındadır.

## Test beklentileri ve bilinçli sınırlar

Mevcut public API/core export listeleri yeni export'larla genişledi;
kayıtlı tüketici figure sayısı 24 → 27, registry öğeleri 28 → 31 oldu.
Mevcut bileşenlerin davranış beklentisi değiştirilmedi. Yeni testler:
Vue 22, Markdown 15, docs 3; **40**. Toplam: Vue 420, Markdown 228,
docs 54; **702**.

Dev sunucusu, canlı tarayıcı/E2E oturumu ve npm yayını yapılmadı. Native
tabloya geçişin gerçek satır yükseklikleri, sütun genişlikleri, uzun label
kırpılması, dar ekran kaydırması, light/dark renk kontrastı, klavye focus
göstergesi, ekran okuyucu header/hücre sırası, JS kapalı/reduced motion,
CLS ve observer/WAAPI gecikmesi tarayıcıda ölçüleceklerdir. Otomatik
cascade/SSR/hydration bu ölçümlerin yerine geçmez.

Teslimat açık izinle imzasız commit ve normal push ile yapılır; hook
atlanmaz, kalıcı git config değiştirilmez. Commit kimliği, temiz çalışma
ağacı ve `origin/main` eşitliği son mesajda komutla doğrulanır.
