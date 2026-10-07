# compare

<GraphCompare title="PLANS" accent="Studio">

| | Solo | Studio |
| --- | --- | --- |
| Registry | yes | yes |
| Accent picker | yes | yes |
| Private source | no | yes |
| Price | $0 | $24 |

</GraphCompare>

<GraphCompare title="RENDER" accent="This">

| | Mermaid | SVG | This |
| --- | --- | --- | --- |
| Source | .md | .svg | .tsx |
| In git | yes | no | yes |
| Themable | no | no | yes |

</GraphCompare>

## Inputs

Typed `columns` and `rows` take precedence independently over item rows and Markdown. Empty arrays suppress fallback. Null permits fallback. All three use `Row` with a `label` and whitespace/comma-separated body. `Col` supplies columns when the prop is absent; boolean data renders ✓ / –.

Static Markdown compiles to a shared `table` model. Dynamic Markdown stays in the runtime reader. The native table has column/row headers and a keyboard-focusable scroll region named by its caption. This is a deliberate accessibility improvement over upstream grid/list DOM.

`accent` selects a column. Text markers true/yes/x/✓ and false/no/–/-/— are parsed only in item/Markdown input. Data strings stay strings; use booleans for marks.

Rows use `vReveal` with a 40 ms step and a 200 ms cap. SSR and reduced motion keep content visible.
