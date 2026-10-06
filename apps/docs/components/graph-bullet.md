# GraphBullet

Write `label: value / target of max`. Target and maximum are optional; the automatic scale includes the value, target and 1. The target marker is clamped to the track; overshoot uses the secondary tone. `ticks`, `glyphs` and `palette` customize the track.

Data `items` take priority over compiled/runtime lists and `Target` items. An empty data array suppresses fallback; null permits fallback. An explicit compiler `list` also takes priority over item markers.

<GraphBullet title="BUDGET">

- Design: 42 / 40
- Motion: 18 / 24
- Docs: 9 / 12

</GraphBullet>

```md
<GraphBullet title="BUDGET">

- Design: 42 / 40
- Motion: 18 / 24
- Docs: 9 / 12

</GraphBullet>
```

<GraphBullet title="LOAD">

- CPU: 72 / 80 of 100
- RAM: 34 / 64 of 100
- SSD: 91 / 90 of 100

</GraphBullet>

```md
<GraphBullet title="LOAD">

- CPU: 72 / 80 of 100
- RAM: 34 / 64 of 100
- SSD: 91 / 90 of 100

</GraphBullet>
```

```vue
<GraphBullet title="BUDGET" :items='[{"label":"Design","value":42,"target":40},{"label":"Motion","value":18,"target":24},{"label":"Docs","value":9,"target":12}]' />
<GraphBullet title="BUDGET">
<Target label="Design" :value="42" :target="40" />
<Target label="Motion" :value="18" :target="24" />
<Target label="Docs" :value="9" :target="12" />
</GraphBullet>
```
