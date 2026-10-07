# mdxcn-markdown

Build-time `markdown-it ^14` plugin for trusted repository Markdown.
Requires Node >=22.18. Tested with VitePress `2.0.0-alpha.20`.
Install both `mdxcn-markdown` and its `mdxcn-vue` peer in the host project.

## Install and requirements

The 0.1.0 candidate has not been published. After publication, with provisional names:

```sh
npm install mdxcn-markdown@^0.1.0 mdxcn-vue@^0.1.0 markdown-it@^14 vue@^3.5.0
```

Before publication install locally built `pnpm pack` tarballs instead. The
component peer requires Vue ^3.5 and Tailwind v4 CSS processing. Verified consumer
tools: Vite 8.3.3, TypeScript 6.0.3 and vue-tsc 3.3.12; older toolchains have not
been qualified. `@types/markdown-it` ships as a dependency for declaration consumers.

## VitePress and withMdxcn

In `.vitepress/config.ts`:

```ts
import { defineConfig } from 'vitepress'
import { mdxcnMarkdown, withMdxcn } from 'mdxcn-markdown'

export default defineConfig({
  markdown: {
    config(md) {
      md.use(mdxcnMarkdown, { renderLinks: true })
      md.use(withMdxcn, { components: ['Callout', 'Quote', 'Terminal', 'Footnotes'] })
    },
  },
})
```

Register the same components in `.vitepress/theme/index.ts`:

```ts
import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { Callout, Quote, Terminal, Footnotes } from 'mdxcn-vue'
import './style.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    for (const [name, component] of Object.entries({ Callout, Quote, Terminal, Footnotes })) {
      app.component(name, component)
    }
  },
} satisfies Theme
```

The CSS entry needs Tailwind v4 processing and imports for `tailwindcss`,
`mdxcn-vue/graph.css`, `mdxcn-vue/host.css` and optional `mdxcn-vue/theme.css`.
Configure `@tailwindcss/vite` in the host Vite config. Register additional graphs
when using their tags. VitePress supplies its footnote parser; other Markdown
hosts must provide one. The tarball consumer check verifies VitePress output,
declarations, registered upgrades and native fallbacks.

```ts
import { mdxcnMarkdown } from 'mdxcn-markdown'

export default {
  markdown: { config: (md) => md.use(mdxcnMarkdown, { renderLinks: true }) },
}
```

Register `GraphStack`, `GraphTable`, `Endpoint`, `Annotate`, `Env`, `Steps`,
`Changelog` and `Decision` from `mdxcn-vue` in your Vue
host. The plugin compiles their Markdown into typed props after host inline
processing and before anchors/highlighting. Unsupported content retains runtime
slots with file/line warnings. Tags need their own lines; lists need a preceding
blank line. Warning locations include frontmatter; `@include` locations refer
to the expanded host file. Generated Vue expressions are executable templates;
this is not a sanitizer for user content.

Full contracts: [project README](https://github.com/dolusoft/mdxcn-vue#readme).

Also exports `withMdxcn`: GitHub/Obsidian alerts, attributed quotes, console/shell
sessions and host footnotes. Options `alerts`, `quotes`, `terminals`, `footnotes`
default to true. The default empty `components` list emits source warnings and
preserves native HTML. Declare only
host-registered names (`Callout`, `Quote`, `Terminal`, `Footnotes`) to emit Vue
tags; Terminal uses `prompt`/`text` bindings. Footnote IDs/backlinks are preserved
and require a host footnote parser. This plugin is also for trusted Markdown.

MIT. Copyright (c) 2026 Keshav Bagaade (mdxcn) and Dolusoft (Vue port).
The full notice in LICENSE must accompany every copy.

## Registry, Comark and Knap

The local `public/r/mdxcn-mdx.json` and `public/r/mdxcn-css.json` items provide
component sources through the host's installed shadcn-vue CLI:

```sh
pnpm exec shadcn-vue add ./registry-input/mdxcn-mdx.json ./registry-input/mdxcn-css.json
```

Obtain these JSON files from this repository first. This installs components,
not the Markdown compiler: install `mdxcn-markdown` separately. Relative paths
are required on Windows. Follow the
[registry guide](https://github.com/dolusoft/mdxcn-vue/blob/main/docs/registry.md).

Comark is a separate optional runtime/document integration using
`graphComponents` or `createGraphComponents` from `mdxcn-vue`; it does not use
this Markdown compiler. Knap uses `graphFilters` from `mdxcn-vue/knap` to emit
ASCII fences or Comark blocks. See the
[Comark guide](https://github.com/dolusoft/mdxcn-vue/blob/main/apps/docs/docs/comark.md)
and [Knap guide](https://github.com/dolusoft/mdxcn-vue/blob/main/apps/docs/docs/knap.md).

## Security and intentional differences

Never compile untrusted Markdown into Vue templates with these plugins. They
are not sanitizers. Comark requires a host tag/attribute/URL security policy;
Knap output inherits the consuming renderer's trust requirements.
The port uses typed models and Vue slots instead of React children and preserves
unsupported Markdown as runtime fallback with warnings. See the
[Markdown contract](https://github.com/dolusoft/mdxcn-vue/blob/main/docs/markdown-contract.md)
and [differences inventory](https://github.com/dolusoft/mdxcn-vue/blob/main/docs/inventory.md).
