# Annotate

Code with numbered notes. End a line with a comment marker such as `// (1)` or
`# (2)`. Marked lines stay bright; the rest recede. Notes keep rich inline content.

## MDX components

<Annotate title="mdx-components.tsx">

```tsx
import { withMdxcn } from "@/registry/default/mdx/mdx" // (1)
import { GraphTimeline } from "@/registry/default/graph-timeline/graph-timeline"

export function useMDXComponents(components) {
  return withMdxcn({ ...components, GraphTimeline }) // (2)
}
```

1. Runs on the server. The file has no "use client".
2. Your overrides stay. A swapped tag still reads as that tag.

</Annotate>

## Retry

<Annotate>

```python
def fetch(url, times=3):  # (1)
    for attempt in range(times):
        try:
            return get(url)
        except TimeoutError:  # (2)
            sleep(2 ** attempt)
    raise
```

1. Three tries. Enough for a flaky network, not for a service that is down.
2. Only timeouts retry. A 500 fails fast.

</Annotate>

## Typed data

<Annotate title="example.ts" code="const active = true // (1)" :notes="['Enable the feature.']" />

```vue
<Annotate title="example.ts" code="const active = true // (1)" :notes="['Enable the feature.']" />
```

`code` and `notes` choose their sources independently: each prop wins over its
Markdown input. Empty strings and arrays suppress fallback; `null` and
`undefined` allow it. The first fence supplies code and the default title;
direct ordered or unordered lists supply notes. The title defaults to `code`.
Nested lists in notes are omitted, matching upstream.

`notes` accepts strings, numbers, VNodes and `ProseNode[]` values. The component
also accepts `palette`, `corner`, `className`, and Vue frame attrs. There is no item API.

The trusted Markdown compiler emits typed props for simple fence/list bodies.
Explicit data props and complex notes retain the runtime reader. SSR stays visible;
the Vue reveal directive caps note stagger at 250 ms.
