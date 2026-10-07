# meter

<GraphMeter title="DISK">

78% — of 500 GB

</GraphMeter>

<GraphMeter title="SHIPPED" value="67%" caption="characters, not a progress bar" />

<GraphMeter title="COVERAGE" :value='0.92' :ticks='10' caption="tests passing" />

`value` wins over the first visible token. Numbers are fractions; a string ending in `%` divides its parsed value by 100. Display and fill clamp to 0–1. The fill count and visible percent use independent `Math.round` operations. Invalid strings become zero; numeric `NaN` remains `NaN`, with no filled cells. `caption` wins independently, including an empty string. Automatic written caption is used only when `value` is null or absent. `written` carries the portable token/caption model.

`ticks` defaults to 14 and accepts a number or static numeric string. Upstream has no threshold colors, `role="meter"`, or `aria-value*` attributes; this port preserves its classes and `sr-only` percentage sentence.

Runtime readers exclude VitePress `header-anchor` links, keep custom components opaque, and traverse fragments without cloning VNodes. Markdown compilation uses the same visible text grammar, including condensed softbreaks and whitespace. Explicit data props retain the runtime path.

DOM and classes follow upstream. The intentional animation difference is `vReveal`: filled cells only, visible SSR, reduced motion support, and a 240 ms delay ceiling. Reveal uses 30 ms increments. Browser checks remain for narrow layouts, glyph fonts, light/dark contrast, screen reader order, reduced motion, CLS and actual observer/WAAPI timing.
