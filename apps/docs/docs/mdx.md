# Markdown upgrades

The React `withMdxcn` component-map API is represented by the existing
`mdxcn-markdown` plugin in Vue. It upgrades alerts to `Callout`, attributed quotes
to `Quote`, console and shell sessions to `Terminal`, and host footnotes to
`Footnotes`. The four options are independent and default to enabled.

> [!TIP]
> This alert uses the registered Vue Callout.

> Keep Markdown readable.
>
> — Ada, Notes

```console
$ run
done
```

Read this note[^demo] and revisit it[^demo].

[^demo]: A **rich note** with a [link](/docs/knap).

## Register the host

```ts
import { withMdxcn } from 'mdxcn-markdown'
import { Callout, Quote, Terminal, Footnotes } from 'mdxcn-vue'

md.use(withMdxcn, {
  components: ['Callout', 'Quote', 'Terminal', 'Footnotes'],
  alerts: true, quotes: true, terminals: true, footnotes: true,
})
for (const [name, component] of Object.entries({ Callout, Quote, Terminal, Footnotes })) {
  app.component(name, component)
}
```

The host must supply a footnote parser (VitePress already does). Missing
components retain native HTML and report a warning. `Footnotes` preserves note
IDs, hidden heading IDs and every backlink, and supports VitePress's section
wrapper. Its title defaults to the lowercased hidden heading or `footnotes`.

The `markdown-it-footnote` backlinks (`↩︎`) have no descriptive accessible name:
they contain only the return glyph and no `aria-label`. Upstream mdxcn renders
GFM footnotes through `remark-gfm`, whose backlinks carry
`aria-label="Back to reference 1"`, so this is an accessibility difference from
upstream. `Footnotes` preserves the host's link VNodes untouched to avoid
rewriting host-owned links or choosing the host's language; override
`footnote_anchor` in your `markdown-it-footnote` renderer to supply descriptive
labels.

The `mdx` registry item distributes these four Vue components and their source
dependencies. Use `mdxcn-markdown` separately for compile-time transformations;
the registry does not copy a second compiler. No React or MDX runtime is added.
Trusted Markdown and host escaping rules remain the existing plugin contract.
