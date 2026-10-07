# mdxcn-vue

Vue 3 graph components ported from [mdxcn](https://github.com/shadcn-labs/mdxcn).
Requires Node >=22.18 and Vue ^3.5 (peer dependency, external to the library).

## Install

Install from npm:

```sh
npm install mdxcn-vue@^0.1.0 vue@^3.5.0
```

Before publication install a locally built `pnpm pack` tarball. CSS needs
Tailwind v4. Tested consumer tools: Vite 8.3.3, TypeScript 6.0.3 and vue-tsc
3.3.12; older toolchains have not been qualified.

This complete component example is extracted from this README and compiled by
`pnpm consumer:check` against the packed library:

<!-- consumer-example -->

```vue
<script setup lang="ts">
import { GraphStack } from 'mdxcn-vue'
import type { StackRow } from 'mdxcn-vue/core'

const rows: StackRow[] = [
  {
    label: 'web',
    segments: [
      { label: 'js', value: 48 },
      { label: 'css', value: 22 },
    ],
  },
]
</script>

<template>
  <GraphStack title="BUNDLE" palette="multi" :rows="rows" />
</template>
```

<!-- /consumer-example -->

```ts
import { GraphStack, GraphTable, Endpoint, GraphTimer } from 'mdxcn-vue'
import { splitLabel, normalizeProseWhitespace } from 'mdxcn-vue/core'
```

Use Tailwind v4 and import these in your CSS entry:

```css
@import 'tailwindcss';
@import 'mdxcn-vue/graph.css';
@import 'mdxcn-vue/host.css';
@import 'mdxcn-vue/theme.css';
```

`graph.css` declares `@source "./"` relative to packaged `dist`, so Tailwind
finds component classes even though `node_modules` is normally excluded.
`host.css` connects host tokens; `theme.css` supplies an optional full theme.
Keep CSS processing enabled; these are Tailwind source files, not prebuilt CSS.

Full API and input contracts: [project README](https://github.com/dolusoft/mdxcn-vue#readme).

MIT. Copyright (c) 2026 Keshav Bagaade (mdxcn) and Dolusoft (Vue port).
The full notice in LICENSE must accompany every copy.

## Knap and Markdown upgrades

`mdxcn-vue/knap` exports framework-independent `graphFilters`,
`createGraphFilters`, metadata and `resolveGraphProps`. It emits upstream ASCII
fences or Comark YAML; Knap remains an optional host dependency. See the
[Knap guide](https://github.com/dolusoft/mdxcn-vue/blob/main/apps/docs/docs/knap.md).

Register `Footnotes` alongside `Callout`, `Quote` and `Terminal` when using
`mdxcn-markdown`'s `withMdxcn` plugin. The `mdx` registry item copies these four
components; the existing Markdown compiler stays in its own package.

For VitePress configuration and component registration, follow the
[Markdown package README](https://github.com/dolusoft/mdxcn-vue/tree/main/packages/mdxcn-markdown#readme).

## Comark

Install optional `comark@0.7.0` and `@comark/vue@0.7.0` in the host. Parse at
build time with `parseMarkdown` from `comark`; pass the returned document to
`MarkdownDocument` from `@comark/vue` with `graphComponents` from `mdxcn-vue`.
Place the renderer under a parent `Suspense` boundary. Use `createGraphComponents`
for a subset. Full example and security policy:
[Comark guide](https://github.com/dolusoft/mdxcn-vue/blob/main/apps/docs/docs/comark.md).

Knap filters can also be called without installing Knap:

```ts
import { graphFilters } from 'mdxcn-vue/knap'

const markdown = graphFilters.graph_meter('0.86')
```

Register `graphFilters` alongside the host's standard filters to use Knap
templates. See the [Knap guide](https://github.com/dolusoft/mdxcn-vue/blob/main/apps/docs/docs/knap.md).

## shadcn-vue registry

For source installation, obtain `public/r/mdxcn-graph-stack.json` and
`public/r/mdxcn-css.json` from this repository, then run the host's installed CLI:

```sh
pnpm exec shadcn-vue add ./registry-input/mdxcn-graph-stack.json ./registry-input/mdxcn-css.json
```

Use relative local JSON paths on Windows. The component item includes its source
dependency closure; CSS is copied to `src/components/mdxcn/styles`. Import
`graph.css`, `host.css` and optional `theme.css` from that directory in your
Tailwind v4 CSS entry. Registry sources do not install the Markdown compiler.
See [registry instructions](https://github.com/dolusoft/mdxcn-vue/blob/main/docs/registry.md).

## Security and differences

The Markdown compiler is for trusted content and generates executable Vue
templates. Comark's host must constrain active tags, attributes and URLs for
untrusted documents; graph prop coercion is not sanitization. Knap output needs
the same trust policy as the renderer that consumes it.
Vue slots and typed props replace React children; some tabular graphs use native
accessible tables. See [input contracts](https://github.com/dolusoft/mdxcn-vue/blob/main/docs/markdown-contract.md)
and [intentional differences](https://github.com/dolusoft/mdxcn-vue/blob/main/docs/inventory.md).
