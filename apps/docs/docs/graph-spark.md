# GraphSpark

<GraphSpark title="DEPLOYS">

2 3 0*3 5 8 6 9 — three quiet days, then a busy week

</GraphSpark>

<GraphSpark title="LATENCY" data="2 3 4 3 6 5 8 7 9 6 10 8" caption="last point is the accent" />

<GraphSpark title="REQUESTS" :data="[4,4,5,3,6,8,7,9,8,6,5,7]" caption="last twelve deploys" />

`data` accepts a numeric array or a run string. It wins over written children, including `[]`; null falls back. `caption` wins independently, including an empty string. Automatic written caption is used only when `data == null`. The compiler supplies the portable `written` model without overriding an explicit caption. The shared core `seriesOf` reader retains aligned labels for future Plot/KPI consumers. Nonempty lists win over raw source, even if every value is invalid. List values use the first parseable numeric prefix; raw source uses finite number tokens and preserves emphasis delimiters in the caption.

The scale uses `Math.max(...data, 1)`, with eight default glyphs. Zero and negative values use the first glyph; equal positive values use the last glyph. Numeric arrays retain `NaN`, making every point use the first glyph; strings filter invalid numbers. Only the last point uses the primary tone. Earlier mono points keep opacity `0.4`. The track is decorative; a screen reader summary includes the point count and caption. Upstream has no axes or min/max labels.

Runtime readers omit VitePress `header-anchor` links. Custom Vue components stay opaque; fragments are transparent. Native DOM and classes follow upstream. Animation uses `vReveal`, a 30 ms increment and a 240 ms total delay cap; Bars starts its left/right groups at 40/160 ms. SSR stays visible and reduced motion uses the shared directive. Spark mono opacity is preserved before hydration too. These are intentional animation differences. No numeric display formatting is performed by these two components.
