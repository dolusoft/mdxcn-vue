# mdxcn-vue

Vue 3 graph components ported from [mdxcn](https://github.com/shadcn-labs/mdxcn).
Requires Node >=22.18 and Vue ^3.5 (peer dependency, external to the library).

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
fences or Comark YAML; Knap remains an optional host dependency. See `/docs/knap`.

Register `Footnotes` alongside `Callout`, `Quote` and `Terminal` when using
`mdxcn-markdown`'s `withMdxcn` plugin. The `mdx` registry item copies these four
components; the existing Markdown compiler stays in its own package.
