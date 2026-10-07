# GraphGantt

Use fractional `start` and `end` positions, optional `complete`, and text `ticks`. Dates are not parsed. `columns` defaults to 24; `stage`, `progress`, `glyphs`, and `palette` customize focus and the track. Data `items` → explicit compiler `list` → nonempty runtime list → `Span` items. Empty data/list arrays suppress fallback; null permits it. Values are clamped for drawing; accessible percentages retain the supplied numeric values. Stagger is capped at 250 ms.

<GraphGantt title="LAUNCH" stage="build" :progress="0.58" :ticks="['q1','q2','q3','q4']">

- design: 0 0.35 1
- **build**: 0.2 0.75 0.55
- docs: 0.55 0.9 0.2
- ship: 0.85 1

</GraphGantt>

```md
<GraphGantt title="LAUNCH" stage="build" :progress="0.58" :ticks="['q1','q2','q3','q4']">

- design: 0 0.35 1
- **build**: 0.2 0.75 0.55
- docs: 0.55 0.9 0.2
- ship: 0.85 1

</GraphGantt>
```

<GraphGantt title="THIS WEEK" :columns="20" :ticks="['mon','wed','fri']">

- **rfc**: 0 0.4
- patch: 0.35 0.8
- review: 0.7 1

</GraphGantt>

```md
<GraphGantt title="THIS WEEK" :columns="20" :ticks="['mon','wed','fri']">

- **rfc**: 0 0.4
- patch: 0.35 0.8
- review: 0.7 1

</GraphGantt>
```

```vue
<GraphGantt title="DATA" :items='[{"label":"design","start":0,"end":0.35,"complete":1},{"label":"build","start":0.2,"end":0.75,"complete":0.55,"accent":true},{"label":"docs","start":0.55,"end":0.9,"complete":0.2},{"label":"ship","start":0.85,"end":1}]' />
<GraphGantt title="ITEM">
<Span label="design" :start="0" :end="0.35" :complete="1" />
<Span label="build" :start="0.2" :end="0.75" :complete="0.55" accent />
<Span label="docs" :start="0.55" :end="0.9" :complete="0.2" />
<Span label="ship" :start="0.85" :end="1" />
</GraphGantt>
```

SSR content stays visible before animation setup. Frame props `corner`, `className`, and Vue attrs are supported.

Intentional difference: the `stage` dimming works through reveal in Vue; upstream's `show` animation overwrites that opacity with 1.
