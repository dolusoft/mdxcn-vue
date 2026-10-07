# Bileşen ve giriş envanteri

Referans: [`shadcn-labs/mdxcn@16d817a`](https://github.com/shadcn-labs/mdxcn/tree/16d817a). Bu belge upstream sözleşmesini kaydeder; Faz 1 sırasında bileşen portu yapılmaz.

Sayım: 46 kullanıcı bileşeni + `graph-frame` temel bileşeni (`Graph`) + `mdx`, `graph-comark`, `graph-knap` entegrasyonları = **50 satır**. `lib/docs/catalog.ts` kataloğu ve `examplesBySlug` haritası temel bileşen dahil 47 kayıt içerir.

## Okuma kuralları

- Faz 7B: `Faq` ve `GraphBoard` Vue portları tamamlandı. İkisi de
  `sections` girdisi kullanır; Board tablo okumaz, Faq yanıtları sürekli
  görünürdür. Açık veri (boş dizi dahil) → Markdown bölümleri; null fallback
  verir. Upstream item bileşeni yoktur. [Faz 7B raporu](phase-7b-report.md).

- Faz 6C: `GraphGantt`, `GraphDiff`, `GraphWaterfall` ve `Span`, `Line`, `Delta`
  Vue portları tamamlandı. Açık derleyici `list` girdisi runtime liste ve item
  girdilerinden önce gelir. Gantt sayısal kesirleri kullanır; tarih ayrıştırmaz.
  Diff `rows` ve `footer` alanlarını bağımsız seçer; Waterfall açık başlangıç/son
  değerlerini korur. Ayrıntılar: [Faz 6C raporu](phase-6c-report.md).

- Faz 6B: `GraphStat`, `GraphSlope`, `GraphBullet` ve `Stat`, `Slope`, `Target`
  Vue portları tamamlandı. Upstream giriş sırası aşağıdaki üç satırdaki gibidir;
  Vue derleyicisinin açık `list` alanı runtime liste ve item girdilerini bastırır.
  Stat token ve ipucu metnini korur; Slope ok ayracı, Bullet hedef/üst sınır
  ayracı kullanır. Ayrıntılar: [Faz 6B raporu](phase-6b-report.md).

- Faz 2B-3 bilinçli erişilebilirlik farkı: Endpoint kod kaydırma bölgeleri tablo
  bölgesi gibi `tabindex="0"`, `role="region"` ve caption adı taşır. Başlık yoksa
  bölgeye `aria-label` verilir; mevcut olmayan caption kimliğine referans üretilmez.
  Tablo ve kod bölgelerinde `:focus-visible` için `outline-offset: 3px` uygulanır.

- Alanlar gerçek kaynak prop şemasından alınmıştır; `className` upstream adıdır. Vue tarafındaki `class` aktarımı Faz 2 sözleşmesinde kararlaştırılacak.
- “Veri” yalnız literal `data` prop anlamına gelmez; `rows`, `items`, `value` gibi ilgili props anlamındadır. Sunum props tek başına veri dizisi desteği sayılmaz.
- Markdown biçimleri upstream tarafından derlenmiş host elementleri üzerinden okunur. Vue hedefi derleme zamanında `markdown-it` token → tipli model; runtime için ayrı `Comark` AST adaptörüdür. Her bileşene üç giriş eklenmez.
- Öncelikte →, soldaki uygun girdi varsa sağdakinin kullanılmadığını belirtir. Kaynaktaki `??` ve `== null` hem `undefined` hem `null` için sonraki girdiye geçer. Boş dizi, boş string, `0` ve `false` bu kontrollerde verilmiş değerdir; boş diziler fallback tetiklemez. Tip şeması dışındaki değerlerin geçerli olması vaat edilmez.
- `listed.length > 0` / `tagged.length > 0` kontrolü, boş listedeki/item dizisindeki girdiyi atlar. İlk `Head`/`Foot` nesnesinin varlık kontrolü boş gövdeyi atlamaz. Seçim girdi düzeyindedir; satır satır birleştirme yoktur.
- `GraphStack` ana seçimi `rowsProp ?` kullanır: boş dizi truthy olduğu için yine veri kazanır; `null`/`undefined` fallback verir. `GraphInvoice.partyOf()` boş stringi `undefined` döndürür ve item fallback yapmaz; nesne truthy ise kazanır.
- Örnek kimliği `components/docs/examples.tsx` içindeki `${slug}-${title}-md` React anahtarıdır; DOM `id` değildir. Örnekler `components/docs/examples.tsx` içindeki `examplesBySlug[slug]` sırasındadır. Katalog kimliği `lib/docs/catalog.ts` içindeki aynı `slug` alanıdır.
- Aile kimlikleri Faz 5 için port gruplarıdır; upstream kategorileri değildir. Tüm aileler prose içindeki `link`, `strong`, `em`, `code` bilgisini koruyan ortak modeli paylaşır.

## Kaynaktan doğrulanan tablo

| Bileşen / katalog kimliği | Alanlar | Desteklenen giriş biçimleri | Gerçek öncelik sırası | Docs örnek kimlikleri | Grammar ailesi |
| --- | --- | --- | --- | --- | --- |
| [`Callout`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/callout/callout.tsx#L50) / `callout` | `type`, `title`, `children`, `corner`, `className` | Veri: yalnız sunum props; Markdown: prose; item: yok | Gövde yalnız `children`; `title ?? type` başlığı | `callout-warning-md`<br>`callout-tip with a title-md` | `prose` |
| [`Quote`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/quote/quote.tsx#L36) / `quote` | `by`, `source`, `title`, `children`, `corner`, `className` | Veri: `by`, `source`; Markdown: prose; item: yok | Gövde yalnız `children`; atıf yalnız `by`, `source` props | `quote-attributed-md`<br>`quote-titled-md` | `prose` |
| [`Steps`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/steps/steps.tsx#L97) / `steps` | `title`, `children`, `corner`, `className` | Veri dizisi: yok; Markdown: `ol` veya `ul` liste (örnekler sıralı); item: `Step` | Markdown liste varsa tamamı → `Step`; birleştirme yok | `steps-install-md`<br>`steps-runbook-md` | `state-list` |
| [`Terminal`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/terminal/terminal.tsx#L75) / `terminal` | `title`, `prompt`, `children`, `corner`, `className` | Veri dizisi: yok; Markdown: metin veya fence; item: yok | `textOf(children)` → satır ayrıştırması; `prompt` komut işareti | `terminal-install-md`<br>`terminal-comment and output-md` | `fence` |
| [`Changelog`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/changelog/changelog.tsx#L94) / `changelog` | `version`, `date`, `title`, `children`, `palette`, `corner`, `className` | Veri dizisi: yok; Markdown: değişiklik listesi; item: `Change` | Markdown liste varsa tamamı → `Change`; başlık `title ?? version` | `changelog-release-md`<br>`changelog-titled-md` | `state-list` |
| [`Annotate`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/annotate/annotate.tsx#L88) / `annotate` | `title`, `code`, `notes`, `children`, `palette`, `corner`, `className` | Veri: `code`, `notes`; Markdown: fence + liste; item: yok | `code` → ilk `pre`; `notes` → `ol`/`ul` notları; iki alan bağımsız | `annotate-mdx-components-md`<br>`annotate-retry-md` | `fence` |
| [`Decision`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/decision/decision.tsx#L89) / `decision` | `title`, `status`, `date`, `options`, `children`, `palette`, `corner`, `className` | Veri: `options`; Markdown: liste + prose; item: yok | `options` → Markdown liste; liste dışındaki prose her durumda çizilir | `decision-database-md`<br>`decision-rendering-md` | `state-list` |
| [`Chat`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/chat/chat.tsx#L85) / `chat` | `title`, `you`, `prompt`, `turns`, `children`, `palette`, `corner`, `className` | Veri: `turns`; Markdown: konuşmacılı liste; item: yok | `turns` → Markdown liste; `you` → ilk konuşmacı → boş metin | `chat-session-md`<br>`chat-support thread-md` | `state-list` |
| [`Env`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/env/env.tsx#L124) / `env` | `title`, `vars`, `children`, `palette`, `corner`, `className` | Veri: `vars`; Markdown: fence, liste, ham metin; item: yok | `vars` → ilk `pre` (boş olsa da) → boş olmayan liste → ham metin | `env-.env-md`<br>`env-as a list-md` | `fence` |
| [`Endpoint`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/endpoint/endpoint.tsx#L133) / `endpoint` | `title`, `method`, `path`, `params`, `blocks`, `children`, `palette`, `corner`, `className` | Veri: `method`, `path`, `params`, `blocks`; Markdown: rota + tablo + fence; item: yok | `method` → ilk rota → `GET`; `path` → ilk rota → `/`; `params` → ilk tablo; `blocks` → fence bölümleri; açıklama paragrafları ayrıca çizilir | `endpoint-one component-md` | `endpoint` |
| [`Keys`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/keys/keys.tsx#L86) / `keys` | `title`, `bindings`, `children`, `palette`, `corner`, `className` | Veri: `bindings`; Markdown: kısayol listesi; item: yok | `bindings` → Markdown liste | `keys-shortcuts-md` | `state-list` |
| [`Faq`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/faq/faq.tsx#L85) / `faq` | `title`, `entries`, `children`, `palette`, `corner`, `className` | Veri: `entries`; Markdown: başlık + yanıt; item: yok | `entries` → başlıklar altında toplanan prose | `faq-install-md` | `sections` |
| [`GraphBoard`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-board/graph-board.tsx#L94) / `graph-board` | `title`, `columns`, `children`, `palette`, `corner`, `className` | Veri: `columns`; Markdown: başlık + liste; item: yok | `columns` → Markdown bölümleri; sonuç ilk dört sütuna kırpılır | `graph-board-roadmap-md`<br>`graph-board-sprint-md` | `sections` |
| [`GraphScore`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-score/graph-score.tsx#L81) / `graph-score` | `title`, `items`, `max`, `children`, `glyphs`, `palette`, `corner`, `className` | Veri: `items`; Markdown: puan listesi; item: yok | `items` → Markdown; satır `max` → prop `max` → seçilen satırlarda ilk dolu `max` → `5` | `graph-score-review-md`<br>`graph-score-out of ten-md` | `numeric-list` |
| [`GraphTable`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-table/graph-table.tsx#L51) / `graph-table` | `title`, `headers`, `rows`, `footer`, `align`, `children`, `corner`, `className` | Veri: `headers`, `rows`, `footer`, `align`; Markdown: tablo; item: `Head`, `Row`, `Foot`, `Cell` | `headers`: prop → ilk `Head` (boş olsa da) → tablo; `rows`: prop → boş olmayan `Row` dizisi → tablo; `footer`: prop → ilk `Foot` → tablo; `align`: prop → `Head` hücre hizaları → tablo | `graph-table-research cost-md`<br>`graph-table-taste, explained-md` | `table` |
| [`GraphSheet`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-sheet/graph-sheet.tsx#L70) / `graph-sheet` | `title`, `headers`, `sections`, `footer`, `align`, `children`, `corner`, `className` | Veri: `headers`, `sections`, `footer`, `align`; Markdown: başlık + tablo; item: `Head`, `Section`, `Row`, `Foot`, `Cell` | `headers`: prop → ilk `Head` → ilk Markdown tablosu; `sections`: prop → boş olmayan `Section` dizisi → Markdown; bölüm `rows`: prop → bölümdeki `Row`; `footer`: prop → ilk `Foot` (Markdown footer alınmaz); `align`: prop → `Head` → ilk Markdown tablosu | `graph-sheet-rfc-md`<br>`graph-sheet-surface-md` | `sections-table` |
| [`GraphFlow`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-flow/graph-flow.tsx#L143) / `graph-flow` | `title`, `rows`, `children`, `palette`, `corner`, `className` | Veri: `rows`; Markdown: oklarla ayrılmış liste, paragraf veya metin; item: `Path` | `rows` → boş olmayan `Path` dizisi → liste → paragraf → ham metin satırları | `graph-flow-optimistic ui-md`<br>`graph-flow-publish path-md` | `flow` |
| [`GraphBars`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-bars/graph-bars.tsx#L116) / `graph-bars` | `title`, `from`, `to`, `children`, `processor`, `glyphs`, `palette`, `corner`, `className` | Veri: `from`, `to`; Markdown: etiketli sayı listesi; item: `Series` | Ortak seri: boş olmayan Markdown liste → `Series`; `from`: prop → seri 0 → boş seri; `to`: prop → seri 1 → boş seri; alanlar bağımsız | `graph-bars-before / after-md`<br>`graph-bars-draft to shipped-md` | `series` |
| [`GraphRank`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-rank/graph-rank.tsx#L63) / `graph-rank` | `title`, `items`, `children`, `max`, `ticks`, `glyphs`, `palette`, `corner`, `className` | Veri: `items`; Markdown: sayı + etiket listesi; item: `Rank` | `items` → boş olmayan Markdown liste → `Rank` | `graph-rank-routes-md`<br>`graph-rank-coverage-md` | `numeric-list` |
| [`GraphCells`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-cells/graph-cells.tsx#L82) / `graph-cells` | `title`, `items`, `children`, `glyphs`, `palette`, `corner`, `className` | Veri: `items`; Markdown: etiketli hücre satırları; item: `Grid` | `items` → boş olmayan Markdown liste → `Grid`; item `cells` → item gövdesi | `graph-cells-two ways to learn-md`<br>`graph-cells-coverage-md` | `grid` |
| [`GraphMeter`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-meter/graph-meter.tsx#L39) / `graph-meter` | `title`, `value`, `ticks`, `caption`, `children`, `glyphs`, `palette`, `corner`, `className` | Veri: `value`, `caption`; Markdown: oran + açıklama; item: yok | `value` → ilk metin token; `caption` → Markdown açıklaması yalnız `value == null` iken | `graph-meter-written-md`<br>`graph-meter-shipped-md`<br>`graph-meter-coverage-md` | `fraction` |
| [`GraphSpark`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-spark/graph-spark.tsx#L41) / `graph-spark` | `title`, `data`, `caption`, `children`, `glyphs`, `palette`, `corner`, `className` | Veri: `data`, `caption`; Markdown: sayılar veya etiketli liste; item: yok | `data` → `seriesOf(children)`; `caption` → Markdown açıklaması yalnız `data == null` iken | `graph-spark-written-md`<br>`graph-spark-latency-md`<br>`graph-spark-requests-md` | `series` |
| [`GraphTree`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-tree/graph-tree.tsx#L123) / `graph-tree` | `title`, `nodes`, `children`, `corner`, `className` | Veri: `nodes`; Markdown: iç içe liste; item: iç içe `Node` | `nodes` → boş olmayan Markdown liste → `Node`; iç içe her seviyede aynı seçim; item `label` → yalnız yaprakta gövde metni | `graph-tree-registry-md`<br>`graph-tree-team-md` | `nested-list` |
| [`GraphTimeline`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-timeline/graph-timeline.tsx#L57) / `graph-timeline` | `title`, `events`, `children`, `palette`, `corner`, `className` | Veri: `events`; Markdown: tarihli liste; item: `Event` | `events` → boş olmayan Markdown liste → `Event` | `graph-timeline-shipped-md`<br>`graph-timeline-incident-md`<br>`graph-timeline-with notes-md` | `state-list` |
| [`GraphCheck`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-check/graph-check.tsx#L140) / `graph-check` | `title`, `items`, `children`, `palette`, `corner`, `className` | Veri: `items`; Markdown: task list; item: `Task` | `items` → boş olmayan Markdown task list → `Task`; Markdown alt listeleri yine ayrıştırılır; item alt görevleri `items` alanından gelir | `graph-check-launch-md`<br>`graph-check-review-md`<br>`graph-check-sub-tasks-md` | `nested-list` |
| [`GraphStack`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-stack/graph-stack.tsx#L120) / `graph-stack` | `title`, `rows`, `children`, `accent`, `ticks`, `glyphs`, `palette`, `corner`, `className` | Veri: `rows`; Markdown: segment listesi; item: `Bar`, iç içe `Segment` | `rows` truthy ise → boş olmayan Markdown liste → `Bar`; satır `segments` → `Segment` dizisi; segment `label` → segment gövdesi | `graph-stack-bundle-md`<br>`graph-stack-tokens-md` | `segments` |
| [`GraphFunnel`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-funnel/graph-funnel.tsx#L55) / `graph-funnel` | `title`, `steps`, `children`, `ticks`, `stage`, `glyphs`, `palette`, `corner`, `className` | Veri: `steps`; Markdown: sayı + etiket listesi; item: `Stage` | `steps` → boş olmayan Markdown liste → `Stage` | `graph-funnel-install-md`<br>`graph-funnel-signup-md` | `numeric-list` |
| [`GraphGantt`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-gantt/graph-gantt.tsx#L67) / `graph-gantt` | `title`, `items`, `children`, `ticks`, `columns`, `stage`, `progress`, `glyphs`, `palette`, `corner`, `className` | Veri: `items`; Markdown: başlangıç/bitiş/ilerleme listesi; item: `Span` | `items` → boş olmayan Markdown liste → `Span` | `graph-gantt-launch-md`<br>`graph-gantt-week-md` | `numeric-list` |
| [`GraphPlot`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-plot/graph-plot.tsx#L48) / `graph-plot` | `title`, `data`, `labels`, `children`, `height`, `variant`, `progress`, `glyphs`, `palette`, `corner`, `className` | Veri: `data`, `labels`; Markdown: sayı metni veya etiketli liste; item: yok | `data` → Markdown seri; `labels` → boş olmayan Markdown etiketleri (veri prop verilse bile) | `graph-plot-labeled rows-md`<br>`graph-plot-p95-md`<br>`graph-plot-errors-md` | `series` |
| [`GraphWaffle`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-waffle/graph-waffle.tsx#L38) / `graph-waffle` | `title`, `value`, `cells`, `columns`, `caption`, `children`, `glyphs`, `palette`, `corner`, `className` | Veri: `value`, `caption`; Markdown: oran + açıklama; item: yok | `value` → ilk metin token; `caption` → Markdown açıklaması yalnız `value == null` iken | `graph-waffle-written-md`<br>`graph-waffle-coverage-md`<br>`graph-waffle-quota-md` | `fraction` |
| [`GraphDiff`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-diff/graph-diff.tsx#L164) / `graph-diff` | `title`, `rows`, `footer`, `children`, `palette`, `corner`, `className` | Veri: `rows`, `footer`; Markdown: delta listesi; item: `Line` | Ortak satırlar: boş olmayan Markdown liste → `Line`; `rows`: prop → `total` olmayan satırlar; `footer`: prop → ilk `total` satırı | `graph-diff-bundle-md`<br>`graph-diff-headcount-md`<br>`graph-diff-rename-md` | `numeric-list` |
| [`GraphInvoice`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-invoice/graph-invoice.tsx#L169) / `graph-invoice` | `title`, `from`, `to`, `meta`, `items`, `totals`, `note`, `children`, `corner`, `className` | Veri: `from`, `to`, `meta`, `items`, `totals`, `note`; Markdown: liste + tablo + paragraflar; item: `From`, `To`, `Meta`, `Item`, `Total` | `from`/`to`: prop → ilk ilgili item; `meta`: prop → item → liste; `items`: prop → item → tablo; `totals`: prop → item → para tutarlı paragraflar; `note`: prop → ilk para tutarı olmayan paragraf | `graph-invoice-studio invoice-md`<br>`graph-invoice-quote-md` | `invoice` |
| [`GraphCompare`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-compare/graph-compare.tsx#L89) / `graph-compare` | `title`, `columns`, `rows`, `children`, `accent`, `palette`, `corner`, `className` | Veri: `columns`, `rows`; Markdown: etiketli tablo; item: `Col`, `Row` | `columns`: prop → boş olmayan `Col` dizisi → tablo; `rows`: prop → boş olmayan `Row` dizisi → tablo | `graph-compare-plans-md`<br>`graph-compare-before after-md` | `table` |
| [`GraphMatrix`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-matrix/graph-matrix.tsx#L72) / `graph-matrix` | `title`, `columns`, `rows`, `children`, `accent`, `palette`, `corner`, `className` | Veri: `columns`, `rows`; Markdown: etiketli tablo; item: `Row` | `columns`: prop → tablo (sütun item yok); `rows`: prop → boş olmayan `Row` dizisi → tablo | `graph-matrix-detect-md`<br>`graph-matrix-latency-md` | `table` |
| [`GraphStat`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-stat/graph-stat.tsx#L51) / `graph-stat` | `title`, `items`, `children`, `corner`, `className` | Veri: `items`; Markdown: sayı + etiket + ipucu listesi; item: `Stat` | `items` → boş olmayan Markdown liste → `Stat` | `graph-stat-this week-md`<br>`graph-stat-latency-md` | `numeric-list` |
| [`GraphKpi`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-kpi/graph-kpi.tsx#L49) / `graph-kpi` | `title`, `value`, `label`, `hint`, `data`, `children`, `glyphs`, `palette`, `corner`, `className` | Veri: `value`, `label`, `hint`, `data`; Markdown: özet satırı + sayılar; item: yok | Her alan bağımsız: `value` → ilk token; `label` → ilk satır etiketi; `hint` → ilk satır açıklaması; `data` → kalan satırlar | `graph-kpi-written-md`<br>`graph-kpi-reads-md`<br>`graph-kpi-latency-md` | `series` |
| [`GraphSpec`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-spec/graph-spec.tsx#L51) / `graph-spec` | `title`, `rows`, `children`, `corner`, `className` | Veri: `rows`; Markdown: alan/değer listesi + notlar; item: `Field` | `rows` → boş olmayan Markdown liste → `Field`; item `value` → gövde metni | `graph-spec-type-md`<br>`graph-spec-ship to-md`<br>`graph-spec-inline code and notes-md` | `state-list` |
| [`GraphActivity`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-activity/graph-activity.tsx#L198) / `graph-activity` | `title`, `days`, `children`, `weekStartsOn`, `max`, `legend`, `caption`, `glyphs`, `palette`, `corner`, `className` | Veri: `days`; Markdown: tarihli sayı listesi veya metin satırları; item: yok | `days` → boş olmayan liste → ham metin satırları | `graph-activity-written-md`<br>`graph-activity-year-md`<br>`graph-activity-quarter-md` | `dated-runs` |
| [`GraphHeatmap`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-heatmap/graph-heatmap.tsx#L80) / `graph-heatmap` | `title`, `columns`, `rows`, `children`, `max`, `legend`, `caption`, `glyphs`, `palette`, `corner`, `className` | Veri: `columns`, `rows`; Markdown: etiketli tablo; item: `Row` | `columns`: prop → tablo; `rows`: prop → boş olmayan `Row` dizisi → tablo | `graph-heatmap-punchcard-md`<br>`graph-heatmap-coverage-md` | `table` |
| [`GraphCalendar`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-calendar/graph-calendar.tsx#L111) / `graph-calendar` | `title`, `year`, `month`, `weekStartsOn`, `marks`, `today`, `children`, `palette`, `corner`, `className` | Veri: `year`, `month`, `marks`, `today`; Markdown: gün listesi; item: yok | `year`/`month` yalnız prop; `marks`: string ise sayılar, aksi halde prop → boş olmayan liste; `today`: prop → listedeki ilk vurgulu gün (`marks` prop verilse bile) | `graph-calendar-with notes-md`<br>`graph-calendar-marked days-md`<br>`graph-calendar-sunday start-md` | `calendar` |
| [`GraphWaterfall`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-waterfall/graph-waterfall.tsx#L100) / `graph-waterfall` | `title`, `items`, `children`, `ticks`, `glyphs`, `palette`, `corner`, `className` | Veri: `items`; Markdown: delta listesi; item: `Delta` | `items` → boş olmayan Markdown liste → `Delta` | `graph-waterfall-margin-md`<br>`graph-waterfall-headcount-md` | `numeric-list` |
| [`GraphUptime`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-uptime/graph-uptime.tsx#L59) / `graph-uptime` | `title`, `days`, `from`, `to`, `columns`, `children`, `glyphs`, `palette`, `corner`, `className` | Veri: `days`; Markdown: durum dizisi ve tekrarlar; item: yok | `days` → `sourceText(children)`; geçersiz durumlar elenir; `from`/`to` yalnız sunum props | `graph-uptime-ninety days-md`<br>`graph-uptime-incident window-md` | `status-runs` |
| [`GraphSlope`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-slope/graph-slope.tsx#L55) / `graph-slope` | `title`, `fromLabel`, `toLabel`, `items`, `children`, `palette`, `corner`, `className` | Veri: `items`; Markdown: önce/sonra ok listesi; item: `Slope` | `items` → boş olmayan Markdown liste → `Slope`; `fromLabel`/`toLabel` yalnız prop | `graph-slope-traffic-md`<br>`graph-slope-latency-md` | `numeric-list` |
| [`GraphBullet`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-bullet/graph-bullet.tsx#L80) / `graph-bullet` | `title`, `items`, `children`, `ticks`, `glyphs`, `palette`, `corner`, `className` | Veri: `items`; Markdown: değer/hedef/üst sınır listesi; item: `Target` | `items` → boş olmayan Markdown liste → `Target` | `graph-bullet-targets-md`<br>`graph-bullet-capacity-md` | `numeric-list` |
| [`GraphTimer`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-timer/graph-timer.tsx#L40) / `graph-timer` | `title`, `kind`, `at`, `caption`, `children`, `palette`, `corner`, `className` | Veri: `at`, `caption`; Markdown: zaman + açıklama; item: yok | `at` → Markdown zaman etiketi; `caption` → Markdown açıklaması (zaman prop verilse bile); `kind=clock` için `at` kullanılmaz | `graph-timer-incident-md`<br>`graph-timer-last deploy-md`<br>`graph-timer-local-md` | `instant` |
| [`GraphCountdown`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-countdown/graph-countdown.tsx#L37) / `graph-countdown` | `title`, `to`, `done`, `caption`, `children`, `palette`, `corner`, `className` | Veri: `to`, `caption`; Markdown: zaman + açıklama; item: yok | `to` → Markdown zaman etiketi; `caption` → Markdown açıklaması (zaman prop verilse bile); `done` yalnız prop | `graph-countdown-written-md`<br>`graph-countdown-freeze-md`<br>`graph-countdown-closed-md` | `instant` |
| [`Graph`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-frame/graph-frame.tsx#L202) / `graph-frame` | `title`, `corner`, `className`, `children`, `...figure` | Veri: sunum props ve `figure` nitelikleri; Markdown: doğrudan gövde; item: veri adaptörü yok | `title` truthy ise `GraphTitle`; `children` doğrudan çizilir; `corner` varsayılan `+` | `graph-frame-titled frame-md`<br>`graph-frame-untitled-md` | `frame` |
| [`withMdxcn`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/mdx/mdx.tsx) / `mdx` | `components`, `options.alerts`, `options.quotes`, `options.terminals`, `options.footnotes` | Veri: component haritası ve seçenekler; Markdown: alert, quote byline, shell fence, footnote; item: yok | Host işaretleme → blockquote için alert → quote → özgün blockquote; uygun shell fence → Terminal → özgün pre; footnote bölümü → Footnotes → özgün section; seçenekler bağımsız, varsayılan true | Katalog gezinme kimliği `/docs/mdx`; `examplesBySlug` girdisi yok; örnekler `app/docs/mdx/page.tsx` | `mdx-upgrade` |
| [`createGraphComponents`, `graphComponents`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-comark/graph-comark.tsx) / `graph-comark` | `installed`, `raw` props; `numeric`, `required` adaptör alanları; layout `cols`, `children` | Veri: YAML props; Markdown: `::tag` gövdesi; item: bileşenin kendi adaptörü | `coerceProps` → gövde mevcutsa veya bütün `required` alanları doluysa bileşen; aksi halde PendingGraph; alan önceliği yukarıdaki bileşene aittir | Katalog gezinme kimliği `/docs/comark`; `examplesBySlug` girdisi yok; `app/docs/comark/page.tsx`, `app/comark/page.tsx` | `runtime-adapter` |
| [`graphFilters`, `createGraphFilters`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-knap/filters.ts) / `graph-knap` | `value`, `param`, `context`; çözülmüş `props`, `format`, içerikte `body` | Veri: nesne/string filtre girdisi; Markdown: içerik `body`; item: yok; çıktı fenced ASCII veya Comark YAML | `resolveGraphProps` → `format=comark` veya ASCII çizici yoksa Comark; aksi halde ASCII; okunamayan/çizilemeyen girdide uyarı + özgün değer | Katalog gezinme kimliği `/docs/knap`; `examplesBySlug` girdisi yok; `app/docs/knap/page.tsx`, `app/knap/page.tsx` | `ascii-adapter` |

## Veri ve item alanları

Üst tablodaki props tek başına iç kayıt şemasını anlatmaz. Aşağıdaki alanlar ilgili kaynakta tanımlanmıştır; `children` item gövdesidir ve `defineItem` bütün item şemalarına bu alanı ekler. `Head`, `Row`, `Foot`, `Cell` ortakları `graph-frame` kaynağındadır. `SpecLine`, `SpecRow` alanlarını; `DiffLineProps`, `DiffRow` alanlarını devralır. `Painted`, `FlatRow`, `ActivityCell` gibi kayıtlar iç çizim modelidir, dış prop değildir.

| Bileşen grubu | İç kayıt / item alanları |
| --- | --- |
| `Steps` | `StepProps`: `title`, `state`, `children` |
| `Changelog` | `ChangeProps`: `type`, `children` |
| `Decision` | `DecisionOption`: `label`, `reason`, `state` |
| `Chat` | `ChatTurn`: `by`, `children`, `aside` |
| `Env` | `EnvVar`: `name`, `value`, `note`, `required` |
| `Endpoint` | `EndpointParam`: `name`, `type`, `description`, `required`; `EndpointBlock`: `label`, `code` |
| `Keys` | `KeyBinding`: `keys`, `action`, `accent` |
| `Faq` | `FaqEntry`: `question`, `answer`, `accent` |
| `GraphBoard` | `BoardItem`: `label`, `note`, `state`; `BoardColumn`: `title`, `items` |
| `GraphScore` | `ScoreRow`: `label`, `value`, `max`, `accent` |
| `GraphSheet` | `SheetSection`: `title`, `rows`; `SectionProps`: `title`, `rows` |
| `GraphFlow` | `FlowNode`: `label`, `tone`, `stretch`; `FlowRow`: `nodes`; `PathProps`: `children` |
| `GraphBars` | `BarSeries`: `label`, `values`, `size`; `SeriesProps`: `label`, `values`, `size` |
| `GraphRank` | `RankItem`: `label`, `value`, `display` |
| `GraphCells` | `CellGrid`: `label`, `cells`; `GridProps`: `label`, `cells` |
| `GraphTree` | `TreeNode`: `label`, `meta`, `accent`, `children`; `NodeProps`: `label`, `meta`, `accent`, `children`; `FlatRow`: `key`, `branch`, `label`, `meta`, `accent` |
| `GraphTimeline` | `TimelineEvent`: `date`, `label`, `state`, `note` |
| `GraphCheck` | `CheckItem`: `label`, `done`, `note`, `items` |
| `GraphStack` | `StackSegment`: `label`, `value`; `StackRow`: `label`, `segments`, `children`; `Painted`: `label`, `glyph`, `count`, `accent` |
| `GraphFunnel` | `FunnelStep`: `label`, `value`, `display` |
| `GraphGantt` | `GanttItem`: `label`, `start`, `end`, `accent`, `complete`; `GanttRow`: `label`, `start`, `end`, `accent`, `complete` |
| `GraphDiff` | `DiffRow`: `label`, `value`, `sign`; `DiffLineProps`: `total` |
| `GraphInvoice` | `InvoiceParty`: `name`, `lines`; `InvoiceMeta`: `label`, `value`; `InvoiceItem`: `description`, `qty`, `rate`, `amount`; `InvoiceTotal`: `label`, `value`, `accent` |
| `GraphCompare` | `CompareRow`: `label`, `values` |
| `GraphMatrix` | `MatrixRow`: `label`, `values` |
| `GraphStat` | `StatItem`: `value`, `label`, `hint`, `accent` |
| `GraphSpec` | `SpecRow`: `label`, `value`, `accent`, `note`; `SpecLine`: `rich` |
| `GraphActivity` | `ActivityDay`: `date`, `count`; `ActivityCell`: `date`, `count`, `inRange` |
| `GraphHeatmap` | `HeatRow`: `label`, `values` |
| `GraphCalendar` | `CalendarMark`: `day`, `accent`, `label` |
| `GraphWaterfall` | `WaterfallItem`: `label`, `value`, `display`, `kind`; `WaterfallRow`: `label`, `value`, `display`, `kind` |
| `GraphSlope` | `SlopeItem`: `label`, `from`, `to` |
| `GraphBullet` | `BulletItem`: `label`, `value`, `target`, `max`, `display`; `BulletRow`: `label`, `value`, `target`, `max`, `display` |
| `Graph` | `CellProps`: `align`; `RowProps`: `label`, `cells` |
| Ortak tablo item bileşenleri | `Head`: `children`; `Row`/`Foot`: `label`, `cells`, `children`; `Cell`: `children`, `align` |
| `GraphStack` iç segment | `Segment`: `label`, `value`, `children`; `Bar`: `label`, `segments`, `children` |
| `GraphInvoice` item bileşenleri | `From`/`To`: `name`, `lines`, `children`; `Meta`: `label`, `value`, `children`; `Item`: `description`, `qty`, `rate`, `amount`, `children`; `Total`: `label`, `value`, `accent`, `children` |

Tablo hücrelerinin `cellsOf` önceliği: dizi prop (boş olsa da) → boş olmayan `Cell` dizisi → string prop veya gövde metni. `GraphCompare`, `GraphMatrix`, `GraphHeatmap` satırları `cellsOf` kullanmaz; metni kendi boolean/sayı grammar kurallarıyla okur. `GraphStack` item gövdesi segment metni olarak ayrıştırılmaz; metin grammar yalnız Markdown liste yolundadır.

## Faz 5 gruplaması

- `prose`, `fence`, `endpoint`, `mdx-upgrade`: zengin gövde, kod boşlukları, marker ve host dönüşümü.
- `state-list`, `numeric-list`: `listItems`, `itemParts`, `splitLabel`, `firstToken`, vurgu ve durum. Sayı grammar kuralları bileşene özeldir; tek regex hepsinin yerine geçmez.
- `nested-list`, `flow`: iç içe ağaç/görevler ile okla ayrılmış düğümler; item sırası ve özyineleme.
- `table`, `sections-table`, `invoice`, `sections`: tablo, `headingSections` ve alan bazında fallback; ortak hücre/prose modeli, farklı öncelikler.
- `series`, `fraction`, `segments`, `grid`: sayı/tekrar dizileri, oran, segment ve hücre matrisi.
- `dated-runs`, `status-runs`, `calendar`, `instant`: UTC tarih dizileri, durum tekrarları, ay/gün hesapları ve mount sonrası saat.
- `frame`: ortak semantik çerçeve, tema ve animasyon; `runtime-adapter` ile `ascii-adapter`: aynı modelin ayrı giriş/çıkış sınırları.

## Alan bazında kabul fixture sözleşmesi

Faz 2 ve Faz 5 testlerinde her veri alanı için yalnız prop, yalnız Markdown, yalnız desteklenen item, eşzamanlı girdiler, `undefined`, `null`, boş dizi ve boş metin durumları bağımsız beklenen sonuçlarla sınanacak. Özellikle:

- `GraphStack`: üç girdi birlikte verilince veri; boş veri dizisi bütün satırları bastırır; veri yokken liste item satırlarını bastırır.
- `GraphTable`/`GraphHeatmap`: veri yokken item satırları Markdown satırlarını bastırır; sütunlar ayrı seçilir.
- `GraphBars`: yalnız `from` prop verildiğinde `to` Markdown/item serisinin ikinci elemanından gelir; birinci seriden tekrar doldurulmaz.
- `GraphInvoice`: `meta`, `items`, `totals` birbirinden bağımsız; boş dizi yalnız kendi alanının fallback girdisini bastırır. Boş taraf stringi item fallback yapmaz.
- `GraphMeter`/`GraphWaffle`/`GraphSpark`: veri prop verilince otomatik Markdown caption alınmaz. `GraphPlot`, `GraphCalendar`, `GraphTimer` ve `GraphCountdown` yardımcı alanlarında bu koşul yoktur.
- `GraphScore`: genel fallback ilk satırdan değil, `rows.find(row => row.max)` sonucundan gelir; satırın kendi `max` değeri genel prop önüne geçer.
- `graph-comark`: `isPresent` boş diziyi ve boş/yalnız whitespace stringi eksik sayar; bu, doğrudan bileşendeki `??` sözleşmesinden farklıdır.

## Upstream’den bilinçli farklar

Bunlar onaylanmış hedef sözleşmelerdir; Faz 1’de henüz bileşen uygulaması yoktur.

1. `GraphStack.segmentsFromText` mevcut `([\d,.]+)\s+(\S+)` eşleşmesini `(\d[\d,.]*)\s+([^\s,]+)` ile değiştirecek. `48 js, 22 css, 30 images` için etiketler `js`, `css`, `images`; değerler `48`, `22`, `30`. `1,200 js` için `1200`/`js`. Bu düzeltme tam grammar kararı değildir; negatif sayılar, çok kelimeli etiketler ve yerel sayı biçimleri ayrıca kararlaştırılacak.
2. Normal metindeki `--graph-muted` kontrast hedefi en az 4.5:1; upstream token/opacity değerleri gerektiğinde değişecek. Görsel fark kontrast gereği açıkça kaydedilecek.
3. Erişilebilirlik: `figure`/başlık ilişkisi, anlamlı tablo/liste semantiği, dekoratif gliflerde `aria-hidden`, ekran okuyucu özetleri, klavye etkileşimi ve reduced-motion kontrolü. SSR içeriği görünür gelecek; observer kurulmadan gizlenmeyecek; tercih değişimi ve unmount animasyonları temizleyecek.
4. Registry dağıtımında eksik `graph-scroll-x`, `scrollbar-graph`, `graph-title-ink` utility tanımları tamamlanacak. Uygulamadaki mevcut CSS’e örtük bağımlılık bırakılmayacak.
5. Accent: graph stilleri, host tema bağlantıları (`--destructive` dahil) ve isteğe bağlı tam tema/presetler ayrı girişler olacak. Preset kapsayıcıda çalışacak; yalnız `html` üzerinde global uygulama zorunlu olmayacak. 14 preset temel bileşen bağımlılığı sayılmayacak.
6. React `motion` yerine Vue `v-reveal` + WAAPI kullanılacak; `0.4` opacity ve glif gecikmeleri korunacak. Markdown derleme zamanı adaptörü ve runtime adaptörü ayrı tutulacak; framework iç API çağrıları taşınmayacak.
7. `GraphTable` yatay kaydırma kabı `tabindex="0"`, `role="region"` ve `aria-labelledby` taşır. Hem bu bölge hem `<table>` aynı `figcaption` kimliğiyle adlandırılır; klavye erişimi upstream'den bilinçli iyileştirmedir.

## Faz 2B-2 uygulama durumu

`Endpoint` ve `GraphTimer` üst tablodaki sabit kaynaklara göre Vue 3 için uygulandı.
`Endpoint` her alanı bağımsız seçer; ilk doğrudan host tabloyu kendi parametre
kurallarıyla okur. Ortak `rowsIn`/`hostCells` VNode okuyucuları tekrar kullanılır;
`GraphTable` toplam satırı algılaması parametrelere uygulanmaz. Açıklama paragrafları,
parametrelerdeki code/link içeriği ve request/response boşlukları korunur. VitePress
fence çıktısının `div` kapsayıcısı upstream doğrudan `pre` sözleşmesinde yoktur;
docs örneğinde `pre > code` veya `blocks` kullanılır. Markdown derleyicisi kapsam dışıdır.

`GraphTimer` ve `useGraphNow` ilk render sırasında upstream gibi `null` saat kullanır;
SSR ile ilk istemci render aynı placeholder değerini üretir. Mount sonrası saniyelik
interval başlar, unmount sırasında temizlenir. Görünmez sekmede interval devam eder;
upstream davranışı korunur. Saat testlerinde `TZ=UTC` ve sahte saat sabittir.

## Lisans ve telif

[Upstream LICENSE](https://github.com/shadcn-labs/mdxcn/blob/16d817a/LICENSE) MIT; özgün satır `Copyright (c) 2026 Keshav Bagaade`. Repo ve iki yayımlanabilir paketin `LICENSE` dosyaları bu bildirimi, izin metnini ve Dolusoft port bildirimini içerir. `package.json` içindeki `files` alanı lisansı npm paketine alır. Registry kaynakları üretildiğinde de bildirim ve izin metni dağıtılmalıdır.

Svelte port yalnız salt okunur tasarım referansıdır; bu fazda Svelte kodu alınmadı. Sonraki fazda kod alınırsa kaynak [`mdxcn-svelte` LICENSE](https://github.com/peopledrivemecrazy/mdxcn-svelte/blob/e99a13a/LICENSE) içindeki `Copyright (c) 2026 Shriji` bildirimi de korunmalı; yalnız Keshav/Dolusoft bildirimi yeterli sayılmamalıdır.

## Araç zinciri ve DevTools doğrulaması

Sistemden alınan doğrulama zamanı: 2026-10-06 Salı 21:17 (Europe/Istanbul). Her satır `npm view <paket> version` çıktısıdır; doğrudan araç bağımlılıkları exact sabitlenmiştir. `vue` peer aralığı tüketici uyumluluğu içindir, geliştirme sürümü değildir.

| Paket | npm latest / kullanılan geliştirme sürümü |
| --- | --- |
| `vue` | `3.5.43` |
| `vite` | `8.3.3` |
| `@vitejs/plugin-vue` | `6.0.9` |
| `vite-plugin-vue-devtools` | `8.2.1` |
| `@vitejs/devtools` | `0.7.6` |
| `tailwindcss` | `4.3.3` |
| `@tailwindcss/vite` | `4.3.3` |
| `vue-tsc` | `3.3.12` |
| `typescript` | Kullanılan `6.0.3`; npm latest `7.0.2`; `typescript-eslint` peer tavanı `<6.1.0` |

Tek ön sürüm istisnası `vitepress@2.0.0-alpha.20` exact sürümüdür. Workspace içindeki Vite override aynı latest sürümünü kullanır.

İki DevTools `apps/docs` uygulamasında etkin; ek playground gerekmiyor. Vite DevTools, `apps/docs/vite.config.ts` içindeki üst seviye `devtools: { apply: 'serve', clientAuth: false }` ayarıyla; Vue DevTools, `apps/docs/.vitepress/config.ts` içindeki `vueDevTools()` eklentisiyle açılır. VitePress Vite yapılandırmasını plugin `config` hook üzerinden taşıdığından `devtools` ayarı bu hook içine konmaz.

- Vue DevTools: `http://localhost:5173/__devtools__/`. Yüklü `vite-plugin-vue-devtools@8.2.1` kaynağında `__devtools__` middleware ve URL yazımı doğrulandı; [resmî eklenti rehberi](https://devtools.vuejs.org/guide/vite-plugin).
- Vite DevTools: `http://localhost:5173/__devtools/` (son underscore sayısı farklı). [Resmî rehber](https://devtools.vite.dev/guide/) yolu ve `apply: 'serve'` ayarını doğrular; yüklü paketin `createDevToolsHub` belgesi aynı mount yolunu verir.
- VitePress varsayılan dev port 5173; port meşgulse sunucunun bildirdiği port kullanılmalı. Bu fazda dev sunucusu başlatılmaz.
- VitePress dev HTML akışı `server.transformIndexHtml` çağırır; dolayısıyla DevTools HTML injection yolu mevcuttur. Config çözümlemesi sunucu açmadan iki eklentiyi doğrular; UI, bağlantı ve browser ölçümü ayrı canlı doğrulamanın işidir.
- `apps/docs/test/config.test.mjs` iki gerçek kontrol içerir: development yapılandırmasında Vue DevTools, Vite DevTools injection/server ve Tailwind; production yapılandırmasında iki DevTools eklentisinin yokluğu. Önceki `echo` test yer tutucusu kaldırılmıştır.

## Faz 7A uygulama notu

`GraphCompare`, `GraphMatrix` ve `GraphHeatmap` tamamlandı. Veri alanları bağımsız seçilir; boş diziler fallback girdisini bastırır, null fallback verir. Compiler `table` alanı ortak `TableModel` taşır; item satırları bundan önce gelir. `Col` yalnız Compare sütunlarını sağlar. Ortak tablo okuyucusu değişmedi. Upstream grid/liste yerine native `table`, `th scope` ve caption ile adlandırılan odaklanabilir kaydırma bölgesi bilinçli erişilebilirlik farkıdır. Heatmap glifleri dekoratif kalır; gerçek sayılar her hücrede `sr-only` metin olarak korunur. Matrix/Heatmap metin ayrıştırması boş hücreleri upstream gibi atlar.

## Faz 7C uygulama notu

`GraphSheet` ve `GraphInvoice` tamamlandı; yukarıdaki alan öncelikleri korundu. Ortak `headingSections`, `tableOf`, `cellsOf`, `alignsOf` ve `resolveTable` okuyucuları değişmedi. Markdown compiler içindeki mevcut tablo okuması `readTable` işlevine taşınarak üç bileşende kullanıldı. Sheet başlıksız tablolardan veri almaz; ilk bölüm boşsa sonraki tablo headers/align fallback sağlamaz. `Total` veya kalın son satır ortak okuyucu tarafından footer olarak ayrılır; Sheet ve Invoice bu Markdown footer değerini kullanmaz. Sheet footer yalnız prop/`Foot` girdisinden gelir. Invoice toplamları `Total` item veya para tutarlı paragraflardır; ara toplam/vergi hesabı, `Intl` veya locale dönüşümü yoktur. Tutarlar literal string kalır.

İki yeni tablo upstream native DOM/a11y yapısını korur; GraphTable erişilebilirlik ekleri kopyalanmadı. `graph-sheet-table` ve `graph-invoice-table` sınıfları yalnız host CSS etkisini kaldırır. Sheet padding değerleri upstream birleşmiş sınıflarla doğrudan gövde kabına uygulanır. `vReveal` satır/toplam gecikmesi 40 ms artar, 240 ms tavanlıdır. Ayrıntılı kanıtlar `docs/phase-7c-report.md` içindedir.
