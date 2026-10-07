<script setup lang="ts">
import { MarkdownDocument } from '@comark/vue'
import { graphComponents } from 'mdxcn-vue'
import { data } from '../.vitepress/comark.data'
</script>

# Comark

Write `::graph-*` blocks in Markdown and pass the parsed document to the Vue
renderer. The adapter uses the existing graph models and item readers.

<Suspense>
  <MarkdownDocument :value="data.document" :components="graphComponents" />
</Suspense>

The example above parses at build time through a VitePress data loader. Only
the document and renderer reach the browser. `Suspense` handles the renderer's
async setup during hydration.

## Install and render

```sh
pnpm add comark@0.7.0 @comark/vue@0.7.0 mdxcn-vue
```

```vue
<script setup lang="ts">
import { MarkdownDocument } from '@comark/vue'
import { parseMarkdown } from 'comark'
import { createGraphComponents, GraphMeter } from 'mdxcn-vue'

const components = createGraphComponents({ 'graph-meter': GraphMeter })
const document = await parseMarkdown('::graph-meter{value=0.86 ticks=28}\n::')
</script>

<template>
  <Suspense>
    <MarkdownDocument :value="document" :components="components" />
  </Suspense>
</template>
```

`parseMarkdown` returns the document itself: pass `document`, rather than
`document.document`. A component with async setup also needs a `Suspense`
boundary in its parent. The example above assumes parsing on the server or at
build time; importing the parser in browser code adds it to the client bundle.

## Attributes, YAML and items

Listed numeric attributes become numbers; exact `true` and `false` strings
become booleans. YAML arrays and objects survive, binding prefixes and kebab
keys normalize, and Vue's native `class`, `data-*` and `aria-*` attributes stay
intact. Existing component rules decide whether explicit data, a Markdown body
or item tags win. Item tags are converted in the owning graph's context;
`row` is a table item inside a table and a responsive layout elsewhere.

`graphComponents` includes all 46 graphs and the `row` layout. Use
`createGraphComponents` to register only the graphs you installed. The adapter
itself needs only Vue; the host supplies Comark. Math, Mermaid and highlighting
plugins and their optional peer packages are unnecessary for this example.

## Streaming

Missing required data produces a visible `PendingGraph` frame (`· · ·`). A
Markdown body bypasses that gate. Comark can auto-close incomplete blocks;
incomplete YAML may fail parsing, so retain the last successfully parsed
document. Update the renderer's `value` with each successful document. Changed
props remount the graph; body updates use Vue reactivity. Network streaming is
the host's responsibility.

GitHub and other plain Markdown hosts do not run this renderer. The separate
ASCII adapter is outside this integration.
