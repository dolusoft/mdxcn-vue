# waffle

<GraphWaffle title="TESTS">

91% — 182 of 200 green

</GraphWaffle>

<GraphWaffle title="COVERAGE" value="73%" caption="73 of 100 tests green" />

<GraphWaffle title="QUOTA" :value='0.4' :cells='40' :columns='8' caption="seats used" />

`value` wins over the first visible token. Numbers are fractions; a string ending in `%` divides its parsed value by 100. Display and fill clamp to 0–1. The fill count and visible percent use independent `Math.round` operations. Invalid strings become zero; numeric `NaN` remains `NaN`, with no filled cells. `caption` wins independently, including an empty string. Automatic written caption is used only when `value` is null or absent. `written` carries the portable token/caption model.

`cells` defaults to 100 and `columns` to 10; both accept numbers or static numeric strings. The final row retains blank padding spans. This is a single fraction, without category allocation or a rounding-total correction. Zero cells render no rows. Like upstream, zero columns with positive cells produce an infinite array length and throw `RangeError`.

Runtime readers exclude VitePress `header-anchor` links, keep custom components opaque, and traverse fragments without cloning VNodes. Markdown compilation uses the same visible text grammar, including condensed softbreaks and whitespace. Explicit data props retain the runtime path.

DOM and classes follow upstream. The intentional animation difference is `vReveal`: filled cells only, visible SSR, reduced motion support, and a 240 ms delay ceiling. Waffle uses 6 ms increments. Browser checks remain for narrow layouts, glyph fonts, light/dark contrast, screen reader order, reduced motion, CLS and actual observer/WAAPI timing.
