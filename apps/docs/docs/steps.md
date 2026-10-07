# steps

A numbered procedure. Bold selects the current step; italic selects the next.

## Install

<Steps title="INSTALL">

1. Copy the source

   Run the shadcn CLI. Files land under registry/default.

2. **Register it**

   Export the component from mdx-components.tsx.

3. *Write*

   Use it between paragraphs. No import line.

</Steps>

## Runbook

<Steps title="ROLLBACK">

1. Flip the flag — cache.v2 to off in the dashboard.
2. Watch p95 — Two minutes. It should drop under 300ms.
3. Write it down — Open the postmortem before you leave.

</Steps>

## Items

<Steps title="ITEMS"><Step title="Install">Run the CLI.</Step><Step title="Register" state="now"><p>Read <a href="./terminal.html">Terminal</a>.</p></Step><Step title="Write" state="next">Use it between paragraphs.</Step></Steps>

```vue
<Steps title="INSTALL">
  <Step title="Install">Run the CLI.</Step>
  <Step title="Register" state="now"><p>Export it.</p></Step>
  <Step title="Write" state="next">Use it.</Step>
</Steps>
```

A nonempty direct `ol` or `ul` list wins over all `Step` markers. An empty list
allows marker fallback. Direct `li` hosts also work when no list host exists.
Loose items use their first paragraph as title and remaining paragraphs as body;
tight items split `Title — body`. Bold anywhere in an item wins over italic.
Titles are plain text; loose bodies and item slots retain rich markup.

`Step` accepts `title` and `state` (`done`, `now`, `next`); there is no upstream
data array API. `Steps` accepts `title`, `corner`, `className`, and Vue frame attrs.
Its `list` prop is compiler input, not an upstream data API. Nested lists, raw
HTML, item tags and dynamic content use the runtime reader with a compiler warning.
Custom Vue wrappers are opaque; fragments are transparent.

SSR content is visible. Reveal delays grow by 60 ms and stop at 300 ms;
reduced motion skips animation.
