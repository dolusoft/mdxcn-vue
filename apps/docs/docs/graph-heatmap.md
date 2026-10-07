# GraphHeatmap

As upstream does, the shared table reader moves a final `Total` row or a row with an entirely bold first cell into the footer when there are multiple body rows. Heatmap does not render that footer, so the row is invisible.

<GraphHeatmap title="DEPLOYS" palette="duo">

| | 0 | 4 | 8 | 12 | 16 | 20 |
| --- | --- | --- | --- | --- | --- | --- |
| Mon | 0 | 1 | 4 | 8 | 6 | 1 |
| Tue | 0 | 0 | 5 | 9 | 4 | 2 |
| Wed | 1 | 0 | 6 | 12 | 5 | 1 |
| Thu | 0 | 2 | 4 | 7 | 8 | 3 |
| Fri | 0 | 1 | 3 | 5 | 2 | 0 |
| Sat | 0 | 0 | 1 | 0 | 0 | 0 |
| Sun | 0 | 0 | 0 | 1 | 0 | 0 |

</GraphHeatmap>

<GraphHeatmap title="TESTS" :max="10" :legend="false">

| | a | b | c | d |
| --- | --- | --- | --- | --- |
| auth | 10 | 8 | 4 | 2 |
| billing | 6 | 10 | 7 | 1 |
| docs | 2 | 3 | 9 | 8 |

</GraphHeatmap>

## Inputs

Typed `columns` and `rows` take precedence independently over item rows and Markdown. Empty arrays suppress fallback. Null permits fallback. All three use `Row` with a `label` and whitespace/comma-separated body.

Static Markdown compiles to a shared `table` model. Dynamic Markdown stays in the runtime reader. The native table has column/row headers and a keyboard-focusable scroll region named by its caption. This is a deliberate accessibility improvement over upstream grid/list DOM.

`max`, `glyphs`, `palette`, `legend` (default true) and `caption` control the intensity scale. Missing values are zero. Numeric text discards empty/non-finite tokens; data arrays keep NaN. Negative values use the empty glyph.

Rows use `vReveal` with a 40 ms step and a 200 ms cap. SSR and reduced motion keep content visible.
