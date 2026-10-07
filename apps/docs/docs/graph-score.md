# score

Ratings as dots. `items` takes precedence over Markdown. Each row can override `max`; the first nonzero row maximum supplies the fallback before 5. Bold selects the accented row. Values clamp to the row maximum.

<GraphScore title="REVIEW" >

- Performance: 4/5
- Accessibility: 5/5
- **Docs: 2.5/5**
- Motion: 4/5

</GraphScore>

```md
<GraphScore title="REVIEW" >

- Performance: 4/5
- Accessibility: 5/5
- **Docs: 2.5/5**
- Motion: 4/5

</GraphScore>
```

Empty data arrays suppress fallback; null uses the slot. Custom component wrappers are opaque. Numeric tokens accept comma thousands, decimal points, percent and suffix units using upstream `parseFloat` behavior. Reveal delay advances by 50 ms and caps at 250 ms.
