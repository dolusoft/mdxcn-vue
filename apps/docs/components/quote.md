# Quote

A framed pull quote. The prose body is a slot; attribution comes only from `by`
and `source`. The pinned upstream examples are shown below.

## Attributed (props)

<Quote by="Paul Graham" source="Taste for Makers">

A thousand barely audible voices all singing in tune.

</Quote>

```vue
<Quote by="Paul Graham" source="Taste for Makers">
  <p>A thousand barely audible voices all singing in tune.</p>
</Quote>
```

## Titled

<Quote title="PRINCIPLE" by="Dieter Rams">

Good design is as little design as possible.

</Quote>

## Markdown byline

> A thousand barely audible voices all singing in tune.
> — Paul Graham, Taste for Makers

```md
> A thousand barely audible voices all singing in tune.
> — Paul Graham, Taste for Makers
```

The frame has no title by default. `by` renders a `cite`; `source` renders muted
text. Either enables the rule and footer, including a source without an author.
An empty author and source hide the footer. `corner`, `className` and Vue `class`
follow the frame contract. Decorative quotation and attribution marks are hidden.

The docs host registers `Quote` and enables `withMdxcn`. The final byline supports
`—`, `―`, `–`, `--`; the first comma followed by a space separates name and source.
An unregistered target retains the native blockquote fallback.
