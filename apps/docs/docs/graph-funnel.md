# GraphFunnel

Stage values and percentages of the first stage. `steps` takes precedence over a nonempty list, then `Stage` markers. Width uses the largest value; every stage gets at least one filled cell. `stage` dims other rows in the mono palette.

<GraphFunnel title="INSTALL" stage="ship">

- 12,400 docs
- 4,100 copy
- 860 ship

</GraphFunnel>

```md
<GraphFunnel title="INSTALL" stage="ship">

- 12,400 docs
- 4,100 copy
- 860 ship

</GraphFunnel>
```

Empty data arrays suppress fallback; null uses the slot. Custom component wrappers are opaque. Numeric tokens accept comma thousands, decimal points, percent and suffix units using upstream `parseFloat` behavior. Reveal delay advances by 50 ms and caps at 250 ms.

Intentional differences: values without `display` use fixed `en-US` formatting (`12400.5` → `12,400.5`). Upstream uses the host locale, which can mismatch between SSR and hydration. The `stage` dimming works through reveal in Vue; upstream's reveal animation overwrites that opacity.
