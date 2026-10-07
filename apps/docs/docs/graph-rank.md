# rank

Numbers as horizontal tracks. `items` takes precedence over a nonempty list, then `Rank` markers. Rows keep input order. `max` supplies the scale; otherwise the largest value (at least 1) does. The first token is preserved for display.

<GraphRank title="ROUTES" >

- 12,400 /docs
- 4,100 /install
- 860 /plot
- 420 /rank

</GraphRank>

```md
<GraphRank title="ROUTES" >

- 12,400 /docs
- 4,100 /install
- 860 /plot
- 420 /rank

</GraphRank>
```

Empty data arrays suppress fallback; null uses the slot. Custom component wrappers are opaque. Numeric tokens accept comma thousands, decimal points, percent and suffix units using upstream `parseFloat` behavior. Reveal delay advances by 50 ms and caps at 250 ms.
