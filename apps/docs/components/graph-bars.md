# GraphBars

<GraphBars title="THROUGHPUT" palette="duo">

- before: 2 4 3 5 2
- **after**: 2 4 3 5 2

</GraphBars>

<GraphBars title="DRAFT TO SHIPPED" processor="edit">

- draft: 1 2 2 3 1
- **shipped**: 3 5 4 6 5

</GraphBars>

`from` and `to` resolve independently: each prop wins, then the first or second written series. A nonempty Markdown list wins over `Series` markers. `series` is the portable model used by the compiler; an explicit `[]` wins. `Series` accepts numeric arrays, run strings such as `2*3`, or slot text. Bold anywhere inside a row selects eight rows (`size="lg"`); otherwise five. Each side scales independently to `Math.max(...values, 1)`. Zero fills the bottom cell; negative values can leave a whole column blank. Numeric arrays retain `NaN`, which blanks all columns. Upstream has no axes, min/max labels or screen reader summary for Bars. The arrows are decorative.

Runtime readers omit VitePress `header-anchor` links. Custom Vue components stay opaque; fragments are transparent. Native DOM and classes follow upstream. Animation uses `vReveal`, a 30 ms increment and a 240 ms total delay cap; Bars starts its left/right groups at 40/160 ms. SSR stays visible and reduced motion uses the shared directive. Spark mono opacity is preserved before hydration too. These are intentional animation differences. No numeric display formatting is performed by these two components.
