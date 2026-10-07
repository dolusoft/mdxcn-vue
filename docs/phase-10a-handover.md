# Faz 10A — devam notu

Bu dosya önceki koşumun arşivlenmiş devam notudur. Kullanıcı bağımlılık ekleme
onayını verdi; aşağıdaki kalan işler tamamlandı. Güncel sonuçlar ve doğrulama
çıktıları [Faz 10A raporunda](phase-10a-report.md) yer alır. Aşağıdaki durum ve
test sayıları önceki koşuma aittir.

## Tamamlanan ve doğrulanan işler

- Küçük docs düzeltmeleri ayrı imzasız commit olarak push edildi: `d4535d7`.
  Plot sayfasındaki KPI opacity kalıntısı kaldırıldı; Cells ve KPI sayfalarında
  tek paragraf içindeki softbreak davranışı açıklığa kavuştu.
- `createGraphComponents`, `graphComponents`, `graphTags`, `coerceProps`,
  `GRAPH_ADAPTERS`, `PendingGraph`, `GraphRow` ve ilgili tipler yazıldı.
  Bunlar henüz commit edilmedi.
- Numeric/required ipuçları upstream'den alındı. Alan önceliği mevcut grafiğe
  bırakılır. Item etiketleri grafiğe özgü mevcut marker bileşenlerine dönüştürülür;
  custom component içerikleri açılmaz. `row`, tablo bağlamında `Row` marker'ına
  dönüştürülür; dış bağlamda responsive layout olarak kalır.
- Native Vue `class` alanı korunur. Kebab-case dönüşümü sırasında `data-*` ve
  `aria-*` alanlarını bozan ilk uygulama, başarısız testten sonra düzeltildi.
- Yeni 28 adaptör testi geçti; public API ve tüketici tip sözleşmesi genişletildi.
- `pnpm -r build`, `pnpm -r test`, `pnpm lint`, `pnpm typecheck`,
  `pnpm format:check`, `pnpm registry:build`, `pnpm registry:check` geçti.
  Son test sayıları Vue 783, Markdown 363, docs 74. Önceki repo toplamı
  1192 idi; Faz 9C raporundaki 1186 bu commit için güncel değildir.
- Registry 50 öğe üretir. `graph-knap` değişmedi.

## Bağımlılık ve upstream örnek düzeltmesi

`pnpm view comark version exports peerDependencies --json` ve
`pnpm view @comark/vue version exports dependencies peerDependencies --json`
komutları her iki paket için 0.7.0 sürümünü doğruladı. `@comark/vue`, ESM Vue 3
renderer'ıdır; `comark: 0.7.0` bağımlılığı vardır. Optional math/highlight/mermaid
peer paketlerini eklemek gerekmez. Yayımlanmış `MarkdownDocument` kaynak kodu
okundu; gövdeyi yerel HTML VNode'ları ve custom component slotları olarak üretir.
Framework iç API'si taşınmadı. Adaptörün kendisi yalnız mevcut Vue peer paketini
kullanır; Comark parser/renderer, test ve docs host'u için gerekir.

Upstream `lib/docs/comark.ts` içindeki `COMARK_WIRE`, `doc.document` kullanır.
Comark 0.7.0 `parseMarkdown` declaration'ı doğrudan `MarkdownDocument` döndürür.
Gerçek parser testiyle doğrulanıp yeni örnekte `value={doc}` kullanılmalıdır.

Kaynaklar: [Vue renderer](https://github.com/comarkdown/comark),
[npm Vue paketi](https://www.npmjs.com/package/@comark/vue).

## `mdx` değerlendirmesi

Upstream `mdx` öğesi ayrı bir grafik değildir: alert → `Callout`, byline →
`Quote`, console/shell session → `Terminal`, footnote bölümünü çerçeveleme ve
MDX host etiketlerini koruma işini yapar. `packages/mdxcn-markdown` içindeki
`withMdxcn` aynı dönüşümleri Markdown host'unda karşılar. Vue tarafında React
component-map API'si taşınmamalıdır. `Footnotes` hedefi host tarafından
sağlanmalıdır; mevcut docs theme bunu kaydetmez. Ayrı bir `mdx` registry öğesi
gereksinimi ve footnote dağıtımı Faz 10B'de ayrıca değerlendirilebilir; bu turda
`mdx` kodu yazılmadı.

## Kalan işler

1. Kurulum onayı gelirse Vue paketinin devDependencies alanına `@comark/vue`
   0.7.0 ve doğrudan test import'u için `comark` 0.7.0 ekle; docs host'una
   `@comark/vue` 0.7.0 ve build-time parser gerekiyorsa `comark` 0.7.0 ekle.
   Bunların adaptör için runtime bağımlılığı olması gerekmez.
2. Bağımsız `test/fixtures/comark-examples.json` henüz testte kullanılmıyor.
   Fixture örneklerini gerçek parser ve Vue renderer ile çalıştır; her aile için
   bağımsız metin beklentisini, PendingGraph ve YAML/binding coercion yolunu doğrula.
   Vue renderer `async setup` kullanır; client hydration için `Suspense` gerekir.
   SSR/hydration testini gerçek renderer'a genişlet ve güncellenen belge ağacını sına.
3. `/docs/comark` sayfasını renderer örneğiyle ekle; build-time AST üzerinden
   gösterim parser'ı client bundle dışında tutabilir. Production docs testini ekle.
4. `pnpm install`, tam kabul zinciri ve `pnpm consumer:check` çalıştır.
   Consumer kontrolü temiz fixture'lara bağımlılık kurduğu için bu turda çalıştırılmadı.
5. `docs/phase-10a-report.md` yaz; sistemden tarih çekmeden tarih ekleme.
   Adapter değişikliklerini dosya adıyla stage et; imzasız commit ve hemen normal
   push yap. Son `git status` temiz olmalı.

Dev sunucusu, tarayıcı/E2E ve npm yayını yapılmadı. Tarayıcıda responsive row,
stream güncellemeleri, glif fontları, light/dark kontrastı, reduced motion,
observer/WAAPI davranışı ve CLS ölçülmeli.
