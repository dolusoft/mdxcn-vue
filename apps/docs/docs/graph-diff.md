<script setup lang="ts">
import { Line } from 'mdxcn-vue'
</script>

# diff

Write `label: +value` or `label: -value`; values remain text. Bold marks the first footer. Direct `~~old~~ new` rewrites in the first paragraph expand into removed and added rows with a shared prefix. `rows` and `footer` independently override compiler/runtime lists and `Line` items. Empty `rows` suppress body rows while preserving a list footer; null permits fallback. An explicit empty `list` suppresses both list fields. Item `total` selects the footer. Stagger is capped at 200 ms; decorative signs are hidden from assistive technology.

<GraphDiff title="BUNDLE" palette="duo">

- vendor: 84 kb
- app: +31 kb
- sourcemaps: -12 kb
- **shipped: 103 kb**

</GraphDiff>

```md
<GraphDiff title="BUNDLE" palette="duo">

- vendor: 84 kb
- app: +31 kb
- sourcemaps: -12 kb
- **shipped: 103 kb**

</GraphDiff>
```

<GraphDiff title="HEADCOUNT">

- start: 12
- hired: +3
- left: -1
- **now: 14**

</GraphDiff>

```md
<GraphDiff title="HEADCOUNT">

- start: 12
- hired: +3
- left: -1
- **now: 14**

</GraphDiff>
```

<GraphDiff title="MIGRATION">

- config: ~~next.config.js~~ next.config.ts
- middleware: ~~middleware.ts~~ proxy.ts
- app: +31 kb

</GraphDiff>

```md
<GraphDiff title="MIGRATION">

- config: ~~next.config.js~~ next.config.ts
- middleware: ~~middleware.ts~~ proxy.ts
- app: +31 kb

</GraphDiff>
```

```vue
<GraphDiff title="DATA" :rows='[{"label":"vendor","value":"84 kb"},{"label":"app","value":"31 kb","sign":"add"},{"label":"sourcemaps","value":"12 kb","sign":"remove"}]' />
<GraphDiff title="ITEM">
<Line label="vendor" value="84 kb" />
<Line label="app" value="31 kb" sign="add" />
<Line label="sourcemaps" value="12 kb" sign="remove" />
</GraphDiff>
```

SSR content stays visible before animation setup. Frame props `corner`, `className`, and Vue attrs are supported.
