# GraphKpi

<GraphKpi title="READS">

**12,400** this week — +18%

4 5 5 6 8 7 9 8 11 10 12 14

</GraphKpi>

<GraphKpi title="READS" value="12,400" label="this week" hint="+18%" data="4 5 5 6 8 7 9 8 11 10 12 14" />

<GraphKpi title="P95" value="142ms" label="read" hint="−18ms" :data='[8, 7, 9, 6, 5, 7, 4, 5, 3, 4, 3, 2]' />

`value`, `label`, `hint`, and `data` each win independently, including empty strings and arrays. Null falls back to the portable `written` model or runtime children. The first visible line supplies a value token, label, and dash-separated hint. Remaining visible lines supply the sparkline. Emphasis is removed from visible value text. Direct paragraphs take precedence over other sibling text, matching upstream `linesOf`. Softbreaks within one paragraph become spaces in Vue runtime templates; use separate paragraphs for the heading and sparkline. This is an intentional difference from upstream literal child strings. No delta is calculated and no number is reformatted. KPI uses its own `kpiOf` grammar, rather than `seriesOf`, because source emphasis and list labels have different semantics.

Runtime readers discard VitePress `header-anchor` links, leave custom components opaque, and read fragments without cloning VNodes. DOM, classes and screen reader summaries follow upstream. Animation uses `vReveal` with a 30 ms increment capped at 240 ms. SSR remains visible; KPI mono points retain opacity `0.4` before hydration. These are intentional animation differences. Browser checks remain for narrow screens, long series, light/dark contrast, reduced motion and observer/WAAPI timing.
