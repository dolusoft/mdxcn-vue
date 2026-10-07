# GraphMatrix

As upstream does, the shared table reader moves a final `Total` row or a row with an entirely bold first cell into the footer when there are multiple body rows. Matrix does not render that footer, so the row is invisible.

<GraphMatrix title="DETECT" accent="Pos">

| | Pos | Neg |
| --- | --- | --- |
| Pos | 41 | 3 |
| Neg | 2 | 54 |

</GraphMatrix>

<GraphMatrix title="P95" accent="write">

| | iad | sfo | nrt |
| --- | --- | --- | --- |
| read | 12 | 18 | 41 |
| write | 28 | 33 | 67 |
| queue | 4 | 6 | 9 |

</GraphMatrix>

## Inputs

Typed `columns` and `rows` take precedence independently over item rows and Markdown. Empty arrays suppress fallback. Null permits fallback. All three use `Row` with a `label` and whitespace/comma-separated body.

Static Markdown compiles to a shared `table` model. Dynamic Markdown stays in the runtime reader. The native table has column/row headers and a keyboard-focusable scroll region named by its caption. This is a deliberate accessibility improvement over upstream grid/list DOM.

`accent` selects a row; other rows use opacity 0.4 for every palette. Numbers use en-US formatting (at most one fractional digit). Empty text cells collapse like upstream; string data stays string.

Rows use `vReveal` with a 40 ms step and a 200 ms cap. SSR and reduced motion keep content visible.
