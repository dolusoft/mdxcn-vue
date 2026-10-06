# mdxcn-markdown

Build-time `markdown-it ^14` plugin for trusted repository Markdown.
Requires Node >=22.18. Tested with VitePress `2.0.0-alpha.20`.
Install both `mdxcn-markdown` and its `mdxcn-vue` peer in the host project.

```ts
import { mdxcnMarkdown } from 'mdxcn-markdown'

export default {
  markdown: { config: (md) => md.use(mdxcnMarkdown, { renderLinks: true }) },
}
```

Register `GraphStack`, `GraphTable` and `Endpoint` from `mdxcn-vue` in your Vue
host. The plugin compiles their Markdown into typed props after host inline
processing and before anchors/highlighting. Unsupported content retains runtime
slots with file/line warnings. Tags need their own lines; lists need a preceding
blank line. Warning locations include frontmatter; `@include` locations refer
to the expanded host file. Generated Vue expressions are executable templates;
this is not a sanitizer for user content.

Full contracts: [project README](https://github.com/dolusoft/mdxcn-vue#readme).

MIT. Copyright (c) 2026 Keshav Bagaade (mdxcn) and Dolusoft (Vue port).
The full notice in LICENSE must accompany every copy.
