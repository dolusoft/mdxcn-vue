# mdxcn-vue

Vue 3 port of [mdxcn](https://github.com/shadcn-labs/mdxcn) — ASCII-style graph and
prose components (tables, bars, timelines, invoices, terminals, ...) that can be fed
by typed props, item components or Markdown.

> **Status:** work in progress. Phase 1 (inventory + workspace) is in place; no
> components are ported yet.

## Upstream

- Source: [`shadcn-labs/mdxcn`](https://github.com/shadcn-labs/mdxcn), pinned at
  commit [`16d817a`](https://github.com/shadcn-labs/mdxcn/commit/16d817a). Parity
  is measured against that commit, not the live site.
- Component inventory, input priorities and intentional differences from upstream:
  [`docs/inventory.md`](docs/inventory.md).

## Workspace

| Path | Purpose |
| --- | --- |
| `packages/mdxcn-vue` | Component library (`vue` is a peer dependency) |
| `packages/mdxcn-markdown` | Build-time Markdown adapter (markdown-it tokens to props) |
| `apps/docs` | Documentation site (VitePress 2, pinned pre-release) |

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

## License

MIT. mdxcn is (c) Keshav Bagaade; the Vue port is (c) Dolusoft. See [LICENSE](LICENSE).
The upstream notice must ship with every copy, including npm packages and registry
files.
