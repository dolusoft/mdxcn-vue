# GraphCells

<GraphCells title="TWO WAYS TO LEARN">

- fragments: 1 0 1 0 0 / 0 1 0 1 0 / 1 0 0 0 1
- a system: 1 1 1 1 1 / 1 1 1 1 1 / 1 1 1 1 1

</GraphCells>

<GraphCells title="COVERAGE">

- this week: 1 1 1 1 0 / 1 1 0 1 1 / 1 0 1 1 1

</GraphCells>

`items` wins even when empty. Otherwise a nonempty direct Markdown list wins over `Grid` items. Each `Grid` uses its `cells` prop (including an empty array) before its body. Multiple direct element blocks each become a row; otherwise slash-separated rows win over separate paragraphs. Softbreaks within one paragraph become spaces in Vue runtime templates and do not create rows. Row tokens use `Number` and discard nonfinite values, without run expansion. Only the exact number `1` fills a cell. Nested lists do not supply parent row text.

```vue
<GraphCells title="GRID">
  <Grid label="r" :cells="[[1, 0], [0, 1]]" />
</GraphCells>
```

Upstream hides cell glyphs from assistive technology and exposes the visible labels; it does not provide a cell-count screen reader summary. This port preserves that behavior.

Runtime readers exclude VitePress `header-anchor` links, keep custom components opaque, and traverse fragments without cloning VNodes. Markdown compilation uses the same visible text grammar, including condensed softbreaks and whitespace. Explicit data props retain the runtime path.

DOM and classes follow upstream. The intentional animation difference is `vReveal`: filled cells only, visible SSR, reduced motion support, and a 240 ms delay ceiling. Reveal uses 30 ms increments. Browser checks remain for narrow layouts, glyph fonts, light/dark contrast, screen reader order, reduced motion, CLS and actual observer/WAAPI timing.
