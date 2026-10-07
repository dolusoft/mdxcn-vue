# terminal

A shell session with command, comment, success and output lines. These are the
two pinned upstream examples. The default frame title is `shell` and prompt is `$`.

## Install (Markdown fence)

<Terminal title="SHELL">

```
$ pnpm dlx shadcn@latest add @mdxcn/callout
✓ registry/default/callout/callout.tsx
✓ registry/default/graph-frame/graph-frame.tsx
  2 files written, 0 conflicts
```

</Terminal>

## Comment and output (text prop)

<Terminal title="TESTS" prompt=">" :text="'# run the suite once\n> pnpm test\n RUN  v3.2.7\n ✓ lib/http/accept.test.ts (12)\n ✓ lib/agent/copy.test.ts (4)\n Test Files  2 passed (2)'" />

```vue
<Terminal title="TESTS" prompt=">"
  :text="'# run the suite once\n> pnpm test\n RUN  v3.2.7\n ✓ lib/http/accept.test.ts (12)\n ✓ lib/agent/copy.test.ts (4)\n Test Files  2 passed (2)'" />
```

## Automatic console upgrade

```console
$ pnpm dlx shadcn@latest add @mdxcn/callout
✓ registry/default/callout/callout.tsx
✓ registry/default/graph-frame/graph-frame.tsx
  2 files written, 0 conflicts
```

````md
```console
$ pnpm dlx shadcn@latest add @mdxcn/callout
✓ registry/default/callout/callout.tsx
✓ registry/default/graph-frame/graph-frame.tsx
  2 files written, 0 conflicts
```
````

`text` is a Vue port extension for `withMdxcn`: explicit text wins over the slot,
including `""`; `null` and `undefined` read the slot. Plain text and `pre > code`
are supported, as is one VitePress `div.language-* > pre` wrapper. Copy buttons
and language labels are omitted. Custom component boundaries remain opaque.

CRLF and CR normalize to LF. Outer blank lines and trailing line whitespace are
removed; indentation and interior blank lines stay. A prompt followed by a space,
or a prompt alone, means command. `#` at column zero means comment; `✓`, `✔`, `√`
at column zero mean success. An indented success mark remains output, as upstream.
Prompt glyphs are decorative; an empty displayed line contains one space.

The docs host registers `Terminal` and enables `withMdxcn`. Console/session fences
upgrade automatically; shell fences with `$ ` prompts also upgrade. Shell scripts
without prompts keep their highlighter. Unregistered targets keep host fences.
