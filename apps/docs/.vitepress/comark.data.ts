import { parseMarkdown } from 'comark'

const source = `:::row{cols=2}
::graph-stack{title="COMARK BODY"}
- docs: 3 js
- app: 2 css
::

::graph-meter
---
title: COMARK YAML
value: "0.86"
ticks: "28"
caption: parsed at build time
---
::
:::

::graph-table{title="WAITING FOR ROWS"}
::`

export default {
  async load() {
    return { source, document: await parseMarkdown(source) }
  },
}

export declare const data: Awaited<ReturnType<typeof import('./comark.data').default.load>>
