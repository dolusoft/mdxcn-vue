# stat

The first token stays visible as written, including units and comma separators. An em/en dash introduces a hint; bold marks the accent. Up to four responsive columns are used.

Data `items` take priority over compiled/runtime lists and `Stat` items. An empty data array suppresses fallback; null permits fallback. An explicit compiler `list` also takes priority over item markers.

<GraphStat title="THIS WEEK">

- 12,400 docs
- 4,100 copies
- **860 shipped**

</GraphStat>

```md
<GraphStat title="THIS WEEK">

- 12,400 docs
- 4,100 copies
- **860 shipped**

</GraphStat>
```

<GraphStat title="P95">

- 142ms read — −18ms
- **410ms write — +22ms**

</GraphStat>

```md
<GraphStat title="P95">

- 142ms read — −18ms
- **410ms write — +22ms**

</GraphStat>
```

```vue
<GraphStat title="THIS WEEK" :items='[{"value":"12,400","label":"docs"},{"value":"4,100","label":"copies"},{"value":"860","label":"shipped","accent":true}]' />
<GraphStat title="THIS WEEK">
<Stat value="12,400" label="docs" />
<Stat value="4,100" label="copies" />
<Stat value="860" label="shipped" accent />
</GraphStat>
```
