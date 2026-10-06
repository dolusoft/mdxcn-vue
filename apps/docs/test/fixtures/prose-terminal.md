# Prose and terminal parity

<Callout type="warning">

The CLI copies files into **registry/default**. It does not add an npm dependency, so there is nothing to update later — edit the source.

</Callout>

> [!WARNING]
> The CLI copies files into **registry/default**. It does not add an npm dependency, so there is nothing to update later — edit the source.

<Quote by="Paul Graham" source="Taste for Makers">

A thousand barely audible voices all singing in *tune*.

</Quote>

> A thousand barely audible voices all singing in *tune*.
> — Paul Graham, Taste for Makers

<Terminal :text="'$ pnpm dlx shadcn@latest add @mdxcn/callout\n✓ registry/default/callout/callout.tsx\n✓ registry/default/graph-frame/graph-frame.tsx\n  2 files written, 0 conflicts'" />

```console
$ pnpm dlx shadcn@latest add @mdxcn/callout
✓ registry/default/callout/callout.tsx
✓ registry/default/graph-frame/graph-frame.tsx
  2 files written, 0 conflicts
```

<Terminal>

```console
$ pnpm dlx shadcn@latest add @mdxcn/callout
✓ registry/default/callout/callout.tsx
✓ registry/default/graph-frame/graph-frame.tsx
  2 files written, 0 conflicts
```

</Terminal>
