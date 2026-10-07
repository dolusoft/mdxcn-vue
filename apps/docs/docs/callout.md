# Callout

An aside with a type glyph and a frame title. The pinned upstream examples use
`warning` and a titled `tip`. The body is a prose slot; there are no item markers.

## Warning (props)

<Callout type="warning">

The CLI copies files into registry/default. It does not add an npm dependency, so there is nothing to update later — edit the source.

</Callout>

```vue
<Callout type="warning">
  <p>The CLI copies files into registry/default. It does not add an npm dependency, so there is nothing to update later — edit the source.</p>
</Callout>
```

## Tip with a title (props and Markdown body)

<Callout type="tip" title="Palette">

One accent is the default. Opt in when a second series needs its own hue:

- palette="duo" for two series
- palette="multi" for three

</Callout>

## Markdown alert

> [!WARNING]
> The CLI copies files into registry/default. It does not add an npm dependency, so there is nothing to update later — edit the source.

```md
> [!WARNING]
> The CLI copies files into registry/default. It does not add an npm dependency, so there is nothing to update later — edit the source.
```

`type` defaults to `note`; supported values are `note`, `tip`, `warning`, `danger`.
`title ?? type` supplies the caption; an empty title hides it. `corner` defaults
to `+`. `className` and Vue `class` apply to the figure. The figure has `role="note"`,
and decorative glyphs are hidden from assistive technology. SSR stays visible.

The docs host registers `Callout` and enables `withMdxcn`. Other hosts must do both;
an unregistered alert retains the host HTML fallback.
