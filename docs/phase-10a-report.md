# Faz 10A — Comark runtime adaptörü

Sistemden alınan zaman: 2026-10-07 Çarşamba 04:55 (Europe/Istanbul).
Başlangıç `main`, `d4535d7`; önceki koşumun commitsiz adaptör değişiklikleri
korunarak tamamlandı. Dev sunucusu ve npm yayını yapılmadı.

## Teslimat

`createGraphComponents` seçilen bileşenleri, `graphComponents` ise 46 grafik ve
`row` layout bileşenini Comark etiketlerine bağlar. `coerceProps`, upstream
`numeric`/`required` ipuçları, `PendingGraph`, public API ve registry teslimatı
tamamlandı. Mevcut grafik modelleri ve item adaptörleri yeniden kullanıldı;
alan önceliği grafik bileşeninde kalır. Custom component içerikleri açılmaz.
Tablo içindeki `row` item marker olur; diğer bağlamlarda responsive layout olur.

`/docs/comark` sayfası gerçek `MarkdownDocument` renderer'ını `Suspense` altında
kullanır. VitePress data loader gövde/YAML örneklerini build sırasında ayrıştırır;
üretim çıktısında üç görünür figure ve responsive row vardır. Client bundle'ın
parser içermediği ayrıca test edildi.

## Bağımlılık kararı

Kullanıcı onayıyla `pnpm add` kullanıldı: Vue paketinin `devDependencies`
alanına `comark` ve `@comark/vue` **0.7.0**, docs host'unun `dependencies`
alanına `@comark/vue` **0.7.0**, `devDependencies` alanına `comark` **0.7.0**
eklendi. Test doğrudan parser import eder; docs parser'ı build sırasında kullanır.
Adaptörün runtime bağımlılığı yalnız mevcut Vue peer paketidir; Comark host'a
aittir. Temiz tarball tüketicisi de iki Comark paketini aynı sürümle kurar.

Yüklü `@comark/vue` manifestinde `katex`, `beautiful-mermaid`, `shiki`
peer'ları `peerDependenciesMeta.optional: true` değerini taşır. Bu özellikler
kullanılmadığından eklenmedi. Paket manifestleri ve yayımlanmış renderer kaynağı
okundu; framework iç API'si taşınmadı.

## Doğrulama ve düzeltilen hatalar

Bağımsız JSON fixture'daki 21 aile örneği gerçek `parseMarkdown` ve Vue
renderer ile sınandı. Ayrıca gerçek parser üzerinden stack/table item marker'ları,
PendingGraph → Markdown gövdesi → YAML/binding güncellemeleri ve SSR/hydration
kontrol edildi. Hydration testinde mismatch veya geçersiz prop uyarısı yoktur.
Sayısal coercion kenarları, veri önceliği, native attribute aktarımı, remount ve
public tip sözleşmesi dahil **52 yeni Vue testi** vardır. Docs'a iki test eklendi.

- Upstream `COMARK_WIRE` örneğindeki `doc.document` kullanımı 0.7.0 ile yanlış:
  gerçek parser doğrudan belge döndürür. Yeni örnek `value=document` kullanır.
- İlk docs stack örneğindeki `█ 3` segment grammar'ına uymuyordu. `3 js`
  biçimine düzeltildi; segmentin `aria-label` değeri de kontrol edilir.
- Önceki koşumun consumer tip fixture'ında kullanılan `GraphStack` import
  edilmemişti. NodeNext kontrolü hatayı yakaladı; import eklendi.
- Yeni tam haritanın üst seviye oluşturulması, yalnız `GraphStack` kullanan
  tüketicide bütün grafiklerin bundle'a girmesine yol açıyordu. Haritayı ve
  `graphTags` dizisini oluşturan saf çağrılara `@__PURE__` işareti eklendi.
  Mevcut tree-shaking kontrolü tekrar geçti; beklentiler gevşetilmedi.

Son kabul komutları, çıkış kodu **0**:

```text
pnpm install              PASS
pnpm -r build             PASS
pnpm -r test              PASS: Vue 807, Markdown 363, docs 76
pnpm lint                 PASS
pnpm typecheck            PASS
pnpm format:check         PASS
pnpm consumer:check       PASS
pnpm registry:build       PASS: 50 items
pnpm registry:check       PASS: 50 items
```

Toplam **1246 test**, başlangıçtaki 1192 teste göre **54 yeni test**.
Consumer çıktıları:

```text
COMARK PACKED CONSUMER PASSED: real parser and Vue renderer
TYPE CONTRACT PASSED: NodeNext, skipLibCheck=false; invalid fields rejected
TREE-SHAKE full=299272 bytes GraphStack=168744 bytes removed=130528 bytes
Vue runtime entries=1
LIBRARY ONLY: full=122196 bytes GraphStack=14721 bytes
REGISTRY INSTALL PASSED: shadcn-vue 2.8.2, 50 items, 103 source files
CONSUMER CHECK PASSED; fixture removed
```

Bundle ölçümleri minify kapalıdır; library sayıları source-map üzerinden
Vue hariç hesaplanır. VitePress tüketicisinde 3 derlenmiş ve 45 kayıtlı figure
kontrolü geçti. Registry CLI kaynak/payload eşitliği, kapalı stdin ile promptsuz
kurulum, typecheck ve build geçti. Loglar
`C:/Users/zahid/source/github/tmp/mdxcn-vue/f10a-*.log`, sonuç özeti
`consumer-results.json` dosyasındadır. Build sırasında mevcut fixture'ların
beklenen Markdown fallback uyarıları görülebilir; kabul komutları sıfırla bitti.

## `mdx` değerlendirmesi ve bilinçli farklar

Upstream `mdx` ayrı grafik değildir: alert → `Callout`, byline → `Quote`,
console/shell session → `Terminal`, footnote çerçevesi ve MDX host etiketlerini
koruma işini yapar. `mdxcn-markdown` içindeki `withMdxcn` ilk dönüşümleri mevcut
Markdown host'unda karşılar. React component-map API'si Vue tarafına taşınmadı;
ayrı `mdx` registry öğesi ve `Footnotes` dağıtımı Faz 10B'de değerlendirilmeli.
Bu turda `mdx` kodu ve `graph-knap` değişikliği yapılmadı.

Vue native `class` alanını korur; React `className` dönüşümü uygulanmaz.
Kebab key dönüşümü `data-*` ve `aria-*` alanlarını korur. Eksik required veri
PendingGraph üretir; gövde varsa geçit atlanır, boş explicit dizinin alan
önceliği mevcut grafikte kalır. Değişen props grafiği yeniden mount eder;
gövde güncellemeleri Vue reactivity üzerinden ilerler. Ağdan streaming ve
başarısız YAML ayrıştırmasında son başarılı belgeyi koruma host'un sorumluluğudur.

## Commit ve sonraki görsel kabul

Küçük docs düzeltmeleri önceki koşumda ayrı imzasız commit `d4535d7` ile push
edildi. Bu teslimat dosya adlarıyla stage edilip kullanıcı izniyle imzasız
commit ve normal push akışına alınır; son commit kimliği teslim mesajında verilir.

Tarayıcı/E2E ölçümü yapılmadı. Responsive row, streaming sırasında yerleşim ve
CLS, glif/font fallback, light/dark kontrastı, reduced motion ve observer/WAAPI
davranışı canlı tarayıcı oturumunda ölçülmelidir. Kabul komutlarının geçmesi bu
görsel ölçümlerin yerine geçmez.
