# faq

Questions and always visible answers, from headings or typed `entries`.

<Faq>

### Is this an npm package?

No. The CLI copies the source into `registry/default`. You own it.

### Does it need MDX?

No. Comark reads `::graph-*` blocks from plain `.md`, and every figure has a fenced ASCII twin for GitHub.

### **Why is my timeline empty?**

Your `mdx-components.tsx` swaps `li` for its own component. Wrap the map in `withMdxcn`.

</Faq>

Explicit `entries` (including `[]`) override headings; `null` falls back. Bold questions use the primary palette tone. Answers accept plain strings, Vue VNodes or portable prose blocks. Strings remain literal text. No item component or accordion is defined upstream.

Fences and tables inside answers use the runtime slot reader and emit a compiler fallback warning; their host-rendered content stays visible.
