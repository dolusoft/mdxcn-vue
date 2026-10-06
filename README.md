# mdxcn-vue

Vue 3 port of [mdxcn](https://github.com/shadcn-labs/mdxcn) — ASCII-style graph and
prose components (tables, bars, timelines, invoices, terminals, ...) that can be fed
by typed props, item components or Markdown.

> **Status:** work in progress. Phase 2A adds the shared frame, typed core,
> `v-reveal` and `GraphStack`; the remaining components are still pending.

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
Geist Mono is a host-supplied font. Full-theme muted text contrast is at least
4.5:1 in both modes; custom host backgrounds need their own contrast check.

`GraphStack` supports typed rows, direct Markdown lists and `Bar`/`Segment` item
tags. Empty `rows` suppress fallback inputs. See the
[examples](apps/docs/components/graph-stack.md),
[Phase 2B Markdown contract](docs/markdown-contract.md) and
[Phase 2A report](docs/phase-2a-report.md) for supported structures and checks.

## License

MIT. mdxcn is (c) Keshav Bagaade; the Vue port is (c) Dolusoft. See [LICENSE](LICENSE).
The upstream notice must ship with every copy, including npm packages and registry
files.
