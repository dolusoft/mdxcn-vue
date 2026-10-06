# GraphTable

Native tables from typed data, Markdown tables or declarative items. The first
three examples use the pinned upstream `research cost` dataset.

## Typed data

<GraphTable title="WHAT THE RESEARCH COST"
  :headers="['Agent', 'Tokens', 'Tool calls', 'Time']"
  :rows="[
    ['Inks and paper', '115,207', '120', '16m'],
    ['Overprint and drift', '135,218', '164', '16m'],
    ['Naming the patterns', '186,716', '112', '18m']
  ]"
  :footer="['Total', '437,141', '396', '~50m']"
  align="left right right right"
/>

```vue
<GraphTable title="WHAT THE RESEARCH COST" :headers="headers" :rows="rows"
  :footer="footer" align="left right right right" />
```

## Markdown table

<GraphTable title="WHAT THE RESEARCH COST">

| Agent | Tokens | Tool calls | Time |
| --- | ---: | ---: | ---: |
| Inks and paper | 115,207 | 120 | 16m |
| Overprint and drift | 135,218 | 164 | 16m |
| Naming the patterns | 186,716 | 112 | 18m |
| Total | 437,141 | 396 | ~50m |

</GraphTable>

```md
<GraphTable title="WHAT THE RESEARCH COST">

| Agent | Tokens | Tool calls | Time |
| --- | ---: | ---: | ---: |
| Inks and paper | 115,207 | 120 | 16m |
| Overprint and drift | 135,218 | 164 | 16m |
| Naming the patterns | 186,716 | 112 | 18m |
| Total | 437,141 | 396 | ~50m |

</GraphTable>
```

## Item tags

<GraphTable title="WHAT THE RESEARCH COST">
  <Head>
    <Cell align="left">Agent</Cell>
    <Cell align="right">Tokens</Cell>
    <Cell align="right">Tool calls</Cell>
    <Cell align="right">Time</Cell>
  </Head>
  <Row>Inks and paper | 115,207 | 120 | 16m</Row>
  <Row>Overprint and drift | 135,218 | 164 | 16m</Row>
  <Row :cells="['Naming the patterns', '186,716', '112', '18m']" />
  <Foot>Total | 437,141 | 396 | ~50m</Foot>
</GraphTable>

```vue
<GraphTable title="WHAT THE RESEARCH COST">
  <Head>
    <Cell align="left">Agent</Cell>
    <Cell align="right">Tokens</Cell>
    <Cell align="right">Tool calls</Cell>
    <Cell align="right">Time</Cell>
  </Head>
  <Row>Inks and paper | 115,207 | 120 | 16m</Row>
  <Row>Overprint and drift | 135,218 | 164 | 16m</Row>
  <Row :cells="['Naming the patterns', '186,716', '112', '18m']" />
  <Foot>Total | 437,141 | 396 | ~50m</Foot>
</GraphTable>
```

## Taste, explained

<GraphTable title="TASTE, EXPLAINED">

| Decision | Reason |
| --- | --- |
| ease-out on enter | feels snappier |
| 180ms, not 400ms | feels faster, more responsive |
| springs for gestures | they carry your momentum |
| scale 0.97 on press | it makes the UI feel alive |
| no animation at all | you open it hundreds of times |

</GraphTable>

Each field selects its input separately: `headers` prop → first `Head` → Markdown
headers; `rows` prop → nonempty `Row` items → Markdown rows; `footer` prop → first
`Foot` → Markdown footer; `align` prop → `Head` cell alignment → Markdown alignment.
Empty arrays and an empty first `Head`/`Foot` still win. Pipe text preserves empty
cells; plain text separates words on whitespace and commas. Nested `Cell` items preserve inline
strong/emphasis/code/links and trim edge whitespace. Typed cells accept strings, numbers, VNodes or `ProseNode[]`.

The Markdown reader consumes a direct host `table` with `thead`/`tbody`/`tfoot` and
`tr`/`th`/`td` slots. Without `thead`, the first body row supplies headings. With no
explicit `tfoot`, a final row starting with **bold** text or `Total` becomes the
footer when there are at least two body rows. Alignment defaults to left for the
first column and right for subsequent columns; `center` is ignored, as upstream.
Fragments are transparent and custom component wrappers stay opaque.

The table keeps native semantics and column header scope. Decorative rules are
hidden from assistive technology. Narrow containers scroll horizontally; the scroll
region is keyboard focusable and shares the table's accessible caption name. SSR
content remains visible; offscreen rows reveal once with a 40ms stagger, capped
at six increments. Reduced motion disables animation.
