# slope

Write `label: from → to` with `→`, `->`, `—>` or `=>`. Values use US formatting with at most one decimal. Direction changes the tone; both directions use the upstream arrow, and equal values use `–`. `fromLabel` and `toLabel` are required props.

Data `items` take priority over compiled/runtime lists and `Slope` items. An empty data array suppresses fallback; null permits fallback. An explicit compiler `list` also takes priority over item markers.

<GraphSlope title="TRAFFIC" palette="duo" fromLabel="2025" toLabel="2026">

- docs: 8,200 → 12,400
- copy: 5,100 → 4,100
- ship: 640 → 860

</GraphSlope>

```md
<GraphSlope title="TRAFFIC" palette="duo" fromLabel="2025" toLabel="2026">

- docs: 8,200 → 12,400
- copy: 5,100 → 4,100
- ship: 640 → 860

</GraphSlope>
```

<GraphSlope title="P95" fromLabel="before" toLabel="after">

- read: 160 → 142
- write: 388 → 410
- cache: 12 → 12

</GraphSlope>

```md
<GraphSlope title="P95" fromLabel="before" toLabel="after">

- read: 160 → 142
- write: 388 → 410
- cache: 12 → 12

</GraphSlope>
```

```vue
<GraphSlope title="TRAFFIC" palette="duo" fromLabel="2025" toLabel="2026" :items='[{"label":"docs","from":8200,"to":12400},{"label":"copy","from":5100,"to":4100},{"label":"ship","from":640,"to":860}]' />
<GraphSlope title="TRAFFIC" palette="duo" fromLabel="2025" toLabel="2026">
<Slope label="docs" :from="8200" :to="12400" />
<Slope label="copy" :from="5100" :to="4100" />
<Slope label="ship" :from="640" :to="860" />
</GraphSlope>
```
