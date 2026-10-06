# mdxcn-vue

Vue 3 port of [mdxcn](https://github.com/shadcn-labs/mdxcn) — ASCII-style graph and
prose components (tables, bars, timelines, invoices, terminals, ...) that can be fed
by typed props, item components or Markdown.

> **Status:** work in progress. Phase 2B-4 includes the shared frame, typed core,
> `v-reveal`, `GraphStack`, `GraphTable`, `Endpoint` and `GraphTimer`;
> build-time Markdown and packaged consumer checks are available; the remaining
> components are still pending.

## Upstream

- Source: [`shadcn-labs/mdxcn`](https://github.com/shadcn-labs/mdxcn), pinned at
  commit [`16d817a`](https://github.com/shadcn-labs/mdxcn/commit/16d817a). Parity
  is measured against that commit, not the live site.
- Component inventory, input priorities and intentional differences from upstream:
  [`docs/inventory.md`](docs/inventory.md).

## Workspace

| Path                      | Purpose                                                   |
| ------------------------- | --------------------------------------------------------- |
| `packages/mdxcn-vue`      | Component library (`vue` is a peer dependency)            |
| `packages/mdxcn-markdown` | Build-time Markdown adapter (markdown-it tokens to props) |
| `apps/docs`               | Documentation site (VitePress 2, pinned pre-release)      |

```sh
pnpm install
pnpm build
pnpm test
pnpm lint
pnpm typecheck
pnpm consumer:check
```

The docs dev server ships with Vue DevTools (`vite-plugin-vue-devtools`, UI at
`/__devtools__/`) and Vite DevTools (`@vitejs/devtools`, UI at `/__devtools/`).
Both are enabled in `apps/docs` on the dev server's reported port (default 5173).
Vite DevTools uses `clientAuth: false`; do not expose it to the network with `vite --host`.
`apps/docs/vite.config.ts` configures Vite DevTools;
`apps/docs/.vitepress/config.ts` configures Vue DevTools and Tailwind. The docs
tests resolve development and production configs without starting a server;
both tools are excluded from production builds. Browser verification is pending.

## GraphStack

```vue
<script setup lang="ts">
import { GraphStack } from 'mdxcn-vue'
import type { StackRow } from 'mdxcn-vue'

const rows: StackRow[] = [
  {
    label: 'marketing',
    segments: [
      { label: 'js', value: 48 },
      { label: 'css', value: 22 },
      { label: 'images', value: 30 },
    ],
  },
]
</script>

<template>
  <GraphStack title="BUNDLE" palette="multi" :rows="rows" />
</template>
```

```css
@import 'tailwindcss';
@import 'mdxcn-vue/theme.css';
```

`graph.css` supplies graph utilities and package-local Tailwind v4 `@source`;
`host.css` connects existing host tokens without redefining them; `theme.css`
adds the optional complete palette and fourteen scoped `data-accent` presets.
Geist Mono is recommended for upstream font parity (licensed under OFL). It is
host-supplied; the package does not distribute font files. Full-theme muted text
contrast is at least 4.5:1 in both modes; custom host backgrounds need their own contrast check.

`GraphStack` supports typed rows, direct Markdown lists and `Bar`/`Segment` item
tags. Empty `rows` suppress fallback inputs. See the
[examples](apps/docs/components/graph-stack.md),
[Phase 2B Markdown contract](docs/markdown-contract.md) and
[Phase 2A report](docs/phase-2a-report.md) for supported structures and checks.

## GraphTable

```vue
<GraphTable title="COST" :headers="['Agent', 'Tokens']"
  :rows="[['Inks and paper', '115,207'], ['Overprint and drift', '135,218']]"
  :footer="['Total', '250,425']" align="left right" />
```

Import `GraphTable` from `mdxcn-vue`. The table accepts typed props, direct Markdown
tables or `Head`/`Row`/`Foot`/`Cell` items. Each field chooses data before items
before Markdown; empty `Head` and `Foot` items still win. Shared `tableOf` and
`labeledTable` readers are available for future table-family components.
See the [three input forms and upstream datasets](apps/docs/components/graph-table.md).

Typed row/footer cells also accept VNodes. Plain headers and alignment strings
split on whitespace and commas. The table and keyboard-focusable scroll region
share the figcaption's accessible name.

## Endpoint

```vue
<Endpoint method="POST" path="/v1/graphs"
  :params="[{ name: 'slug', type: 'string', required: true }]"
  :blocks="[{ label: 'json', code: '{ &quot;ok&quot;: true }' }]" />
```

Import `Endpoint` from `mdxcn-vue`. It reads typed data or direct host paragraphs,
parameter tables and `pre > code` blocks. Code/link descriptions remain rich;
each prop selects its input independently. See the
[upstream example and input contract](apps/docs/components/endpoint.md).

## GraphTimer

```vue
<GraphTimer title="LOCAL" kind="clock" />
```

Import `GraphTimer` from `mdxcn-vue`. The `elapsed`, `ago` and `clock` modes share
a deterministic SSR/first-client placeholder and update once per second after
mount. `useGraphNow` clears its interval on unmount. See the
[three upstream examples](apps/docs/components/graph-timer.md) for instant and caption inputs.

## Build-time Markdown

```ts
import { mdxcnMarkdown } from 'mdxcn-markdown'

export default {
  markdown: {
    config: (md) => { md.use(mdxcnMarkdown, { renderLinks: true }) },
  },
}
```

Use this plugin in VitePress `markdown.config` for **trusted repository Markdown
only**. It generates executable Vue template expressions; it is not a sanitizer
for user content. `GraphStack` lists, `GraphTable` tables and `Endpoint` paragraphs,
parameter tables and fences become typed props before anchors and highlighting.
Inline strong/emphasis/code/links remain rich. The host supplies `markdown-it`;
`mdxcn-markdown` requires `markdown-it ^14` as a peer. VitePress integration is
tested with `2.0.0-alpha.20`; component block, entity and link behavior depends
on that host version. Other hosts must supply equivalent token/renderer rules.
the compiler does not ship a runtime Markdown renderer. `renderLinks: true`
retains host URL rewrites, link titles and external link attributes.

Unsupported or dynamic blocks retain runtime slots and emit `file:line` warnings.
Warning lines include removed VitePress frontmatter. VitePress `@include` expands
content before parsing: locations refer to the expanded host document, not the
included file; this plugin does not provide an include source map.
Opening/closing component tags must occupy separate lines. Put a blank line
before a component's Markdown list: without it, VitePress treats the list as
raw HTML text. Both compile and runtime-slot paths retain this host behavior
and emit a warning instead of claiming a successful graph conversion.
Explicit data props also keep runtime field precedence. See the
[compiler contract and limits](docs/markdown-contract.md). Grammar/clock helpers
`words`, `numbers`, `splitDash` and `pad2` are exported from `mdxcn-vue/core`.
The primary entry has an explicit reviewed export list.

`pnpm consumer:check` packs both libraries and installs isolated Vite/Vue/Tailwind
and VitePress projects outside the repo (`../tmp/mdxcn-vue/consumer-*`). It verifies
published files and notices, declaration resolution, CSS source scanning (with
a negative control), production builds, one Vue runtime entry, and tree-shaking
of non-imported components/Markdown. The CI consumer job runs the same script.

## shadcn-vue registry

`pnpm registry:build` generates `registry.json` and seven `public/r/mdxcn-*.json`
items from the library sources: the four components, shared frame, core and CSS.
`pnpm registry:check` rejects stale payloads. The format follows the
[shadcn-vue item schema](https://shadcn-vue.com/schema/registry-item.json).

Use `shadcn-vue add ./path/to/mdxcn-graph-stack.json` (and the
CSS item) in a Vite/Vue project. Each item includes its local dependency closure
and uses explicit `src/components/mdxcn/` targets; relative imports remain valid
without a registry server or alias rewriting. Targets use the CLI's `~/` prefix
to preserve `src/`. Payload paths use `.txt` transport suffixes because CLI 2.8.2
otherwise parses CSS/license files as JavaScript; target files retain their
actual extensions. Use relative local JSON paths on Windows (drive-letter paths
are treated as URLs by that CLI). Other project layouts can relocate
the whole directory. CSS files need Tailwind v4 processing and imports from the
host CSS entry; choose `host.css` and optional `theme.css` as with npm consumption.
Each copied file and JSON payload retains the full MIT notice. The consumer
check installs all seven items with the real CLI, then typechecks and builds.

## License

MIT. mdxcn is (c) Keshav Bagaade; the Vue port is (c) Dolusoft. See [LICENSE](LICENSE).
The upstream notice must ship with every copy, including npm packages and registry
files.
